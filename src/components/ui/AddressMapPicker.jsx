import { useState, useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom Leaflet DivIcon with brand styling
const createCustomPin = () => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: '<div class="custom-map-pin-pulse"></div><div class="custom-map-pin-icon"></div>',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34]
  })
}

// Quick city locations in Vietnam
const QUICK_CITIES = [
  { name: 'TP. Hồ Chí Minh', lat: 10.7769, lng: 106.7009 },
  { name: 'Quy Nhơn (Bình Định)', lat: 13.7820, lng: 109.2197 },
  { name: 'Hà Nội', lat: 21.0285, lng: 105.8542 },
  { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022 }
]

const DEFAULT_CENTER = QUICK_CITIES[0]

export default function AddressMapPicker({
  value = '',
  onChange,
  required = false,
  placeholder = 'Nhập số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố...'
}) {
  const [showMap, setShowMap] = useState(true)
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [currentCoords, setCurrentCoords] = useState(null)

  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const searchTimeoutRef = useRef(null)
  const dropdownRef = useRef(null)

  // Reverse geocode lat/lng to Vietnamese address string
  const reverseGeocode = useCallback(async (lat, lng) => {
    setIsReverseGeocoding(true)
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'vi' }
      })
      if (res.ok) {
        const data = await res.json()
        if (data && data.display_name) {
          onChange(data.display_name, { lat, lng })
          if (markerRef.current) {
            markerRef.current.bindPopup(`<b>Địa chỉ giao hàng:</b><br/>${data.display_name}`).openPopup()
          }
        }
      }
    } catch (err) {
      console.warn('Reverse geocode error:', err)
    } finally {
      setIsReverseGeocoding(false)
    }
  }, [onChange])

  // Move or create marker on map
  const setMarkerPosition = useCallback((lat, lng, doReverse = false, zoom = 16) => {
    setCurrentCoords({ lat: lat.toFixed(5), lng: lng.toFixed(5) })

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], zoom)

      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng], {
          icon: createCustomPin(),
          draggable: true
        }).addTo(mapInstanceRef.current)

        markerRef.current.on('dragend', (event) => {
          const pos = event.target.getLatLng()
          setMarkerPosition(pos.lat, pos.lng, true)
        })
      } else {
        markerRef.current.setLatLng([lat, lng])
      }

      if (doReverse) {
        reverseGeocode(lat, lng)
      }
    }
  }, [reverseGeocode])

  // Initialize Leaflet Map
  useEffect(() => {
    if (!showMap || !mapContainerRef.current || mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      zoom: 13,
      scrollWheelZoom: true
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map)

    // Map click handler to set marker
    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      setMarkerPosition(lat, lng, true)
    })

    mapInstanceRef.current = map

    setTimeout(() => {
      map.invalidateSize()
    }, 250)

    return () => {
      map.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }, [showMap, setMarkerPosition])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search autocomplete using Photon + Nominatim
  const handleInputChange = (e) => {
    const query = e.target.value
    onChange(query)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!query || query.trim().length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setShowDropdown(true)

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // First try Photon (fastest autocomplete)
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=vi&limit=6`
        const pRes = await fetch(photonUrl)
        if (pRes.ok) {
          const pData = await pRes.json()
          if (pData && pData.features && pData.features.length > 0) {
            const list = pData.features.map((f, idx) => {
              const p = f.properties || {}
              const main = p.name || p.street || 'Địa điểm'
              const sub = [p.street, p.district, p.city || p.state, p.country].filter(Boolean).filter(s => s !== main).join(', ')
              const full = [main, sub].filter(Boolean).join(', ')
              return {
                id: `p-${idx}`,
                mainText: main,
                subText: sub,
                fullName: full,
                lat: f.geometry.coordinates[1],
                lng: f.geometry.coordinates[0]
              }
            })
            setSuggestions(list)
            setIsSearching(false)
            return
          }
        }

        // Fallback to Nominatim
        const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&addressdetails=1&limit=6`
        const nRes = await fetch(nomUrl, { headers: { 'Accept-Language': 'vi' } })
        if (nRes.ok) {
          const nData = await nRes.json()
          const list = (nData || []).map((item, idx) => {
            const parts = item.display_name.split(',')
            return {
              id: item.place_id || `n-${idx}`,
              mainText: parts[0],
              subText: parts.slice(1).join(',').trim(),
              fullName: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            }
          })
          setSuggestions(list)
        }
      } catch (err) {
        console.warn('Autocomplete error:', err)
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }

  // Select a suggestion
  const handleSelectSuggestion = (item) => {
    onChange(item.fullName, { lat: item.lat, lng: item.lng })
    setShowDropdown(false)
    setSuggestions([])

    if (!showMap) setShowMap(true)

    setTimeout(() => {
      setMarkerPosition(item.lat, item.lng, false, 17)
      if (markerRef.current) {
        markerRef.current.bindPopup(`<b>Địa chỉ đã chọn:</b><br/>${item.fullName}`).openPopup()
      }
    }, 150)
  }

  // Quick pan to popular city
  const handleSelectCity = (city) => {
    if (!showMap) setShowMap(true)
    setTimeout(() => {
      setMarkerPosition(city.lat, city.lng, true, 14)
    }, 150)
  }

  // Device GPS
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị GPS.')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        if (!showMap) setShowMap(true)

        setTimeout(() => {
          setMarkerPosition(lat, lng, true, 17)
        }, 150)
      },
      (error) => {
        setIsLocating(false)
        alert('Không thể lấy vị trí: ' + (error.message || 'Vui lòng cấp quyền truy cập vị trí.'))
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  return (
    <div className="map-picker-container" ref={dropdownRef}>
      {/* Top Toolbar */}
      <div className="map-picker-toolbar">
        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-dark)' }}>
          Địa chỉ giao hàng {required && '*'}
        </label>
        <div className="map-picker-toolbar-actions">
          <button
            type="button"
            className="map-btn-action"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            title="Lấy vị trí GPS hiện tại của thiết bị"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <circle cx="12" cy="12" r="7" />
              <polyline points="12 9 12 12 13.5 13.5" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
            {isLocating ? 'Đang định vị...' : 'Vị trí hiện tại'}
          </button>

          <button
            type="button"
            className={`map-btn-action ${showMap ? 'active' : ''}`}
            onClick={() => {
              setShowMap(!showMap)
              if (!showMap && mapInstanceRef.current) {
                setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200)
              }
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            {showMap ? 'Ẩn bản đồ' : 'Xem bản đồ'}
          </button>
        </div>
      </div>

      {/* Input Field with Search Icon */}
      <div className="map-input-wrap">
        <svg className="map-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>

        <textarea
          name="address"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true)
          }}
          placeholder={placeholder}
          required={required}
          rows="2"
        />

        {value && (
          <button
            type="button"
            className="map-input-clear-btn"
            onClick={() => {
              onChange('')
              setSuggestions([])
              setShowDropdown(false)
            }}
            title="Xóa địa chỉ"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && (
        <ul className="map-suggestions-dropdown">
          {isSearching && (
            <li className="map-suggestion-loading">
              <span className="auth-spinner" style={{ width: 16, height: 16, borderTopColor: 'var(--primary)', borderColor: 'rgba(45,90,45,0.2)' }} />
              Đang tìm kiếm gợi ý địa chỉ...
            </li>
          )}

          {!isSearching && suggestions.length === 0 && (
            <li className="map-suggestion-empty">
              Không tìm thấy gợi ý phù hợp. Bạn vẫn có thể tiếp tục nhập hoặc nhấp trên bản đồ.
            </li>
          )}

          {!isSearching && suggestions.map((item) => (
            <li
              key={item.id}
              className="map-suggestion-item"
              onClick={() => handleSelectSuggestion(item)}
            >
              <div className="map-suggestion-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="map-suggestion-texts">
                <span className="map-suggestion-main">{item.mainText}</span>
                {item.subText && <span className="map-suggestion-sub">{item.subText}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Quick City Buttons */}
      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Chọn nhanh:</span>
        {QUICK_CITIES.map((c) => (
          <button
            key={c.name}
            type="button"
            className="map-btn-action"
            style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            onClick={() => handleSelectCity(c)}
          >
            📍 {c.name}
          </button>
        ))}
      </div>

      {/* Interactive Map View */}
      {showMap && (
        <div className="map-canvas-card">
          <div className="map-canvas-header">
            <span className="map-canvas-header-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
              Bản đồ định vị giao hàng (OpenStreetMap)
            </span>

            <span className={`map-canvas-badge ${isReverseGeocoding ? 'loading' : ''}`}>
              {isReverseGeocoding ? 'Đang cập nhật địa chỉ...' : 'Nhấp vào bản đồ để ghim vị trí'}
            </span>
          </div>

          <div ref={mapContainerRef} className="map-canvas" />

          <div className="map-canvas-footer">
            <span className="map-canvas-hint">
              💡 Bạn có thể kéo thả ghim hoặc nhấp vào bất kỳ đâu trên bản đồ để chọn vị trí giao.
            </span>
            {currentCoords && (
              <span className="map-canvas-coords">
                {currentCoords.lat}, {currentCoords.lng}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
