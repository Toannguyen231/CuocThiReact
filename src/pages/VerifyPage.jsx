import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { products } from '../data/products'

/**
 * Trang xác thực / kiểm tra nguồn gốc sản phẩm Chiếu Nẫu
 * Tích hợp Camera QR Scanner thời gian thực (html5-qrcode) với khung quét và video viewfinder hiển thị rõ ràng
 * Route: /quet-ma hoặc /quet-ma.html
 */
export default function VerifyPage() {
  const [searchParams] = useSearchParams()
  const [inputCode, setInputCode] = useState('')
  const [searchedProduct, setSearchedProduct] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Trạng thái Camera quét QR
  const [isScanning, setIsScanning] = useState(false)
  const [scannerError, setScannerError] = useState('')
  const [cameraLoading, setCameraLoading] = useState(false)
  const html5QrCodeRef = useRef(null)
  const fileInputRef = useRef(null)

  // Trích xuất mã sản phẩm từ chuỗi quét được
  const extractCodeFromScan = (decodedText) => {
    try {
      if (decodedText.includes('quet-ma?code=')) {
        const urlObj = new URL(decodedText, window.location.origin)
        return urlObj.searchParams.get('code') || decodedText
      }
      if (decodedText.includes('/san-pham/')) {
        const parts = decodedText.split('/san-pham/')
        return parts[1]?.split('?')[0]?.replace(/\/$/, '') || decodedText
      }
    } catch {
      // Fallback
    }
    return decodedText.trim()
  }

  // Tra cứu sản phẩm theo ID hoặc slug
  const lookupProduct = (code) => {
    if (!code) return null
    const query = code.trim().toLowerCase()
    return products.find(
      (p) => String(p.id) === query || p.slug.toLowerCase() === query
    )
  }

  // Tự động kiểm tra nếu có query params ?code=...
  useEffect(() => {
    const codeParam = searchParams.get('code')
    if (codeParam) {
      setInputCode(codeParam)
      const found = lookupProduct(codeParam)
      setSearchedProduct(found || null)
      setHasSearched(true)
    }
  }, [searchParams])

  // Dọn dẹp camera an toàn khi unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current
            .stop()
            .then(() => html5QrCodeRef.current.clear())
            .catch(() => {})
        } catch {
          // ignore
        }
      }
    }
  }, [])

  // Bật camera quét QR
  const startScanner = async () => {
    setScannerError('')
    setCameraLoading(true)
    // Chuyển isScanning = true ngay để DOM phần tử #qr-reader-region được hiển thị cho html5-qrcode tính toán kích thước
    setIsScanning(true)

    // Đợi 1 tick để DOM mount và hiển thị đúng layout
    await new Promise((resolve) => setTimeout(resolve, 80))

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-region')
      }

      const qrCodeSuccessCallback = (decodedText) => {
        console.log('Quét thành công mã QR:', decodedText)
        const code = extractCodeFromScan(decodedText)
        setInputCode(code)
        const found = lookupProduct(code)
        setSearchedProduct(found || null)
        setHasSearched(true)

        // Tự động dừng camera sau khi đã quét được
        stopScanner()
      }

      const config = {
        fps: 15,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        config,
        qrCodeSuccessCallback,
        () => {
          // Bỏ qua frame không có QR để mượt video
        }
      )
    } catch (err) {
      console.error('Không thể mở camera:', err)
      setIsScanning(false)
      setScannerError(
        'Không thể mở camera (có thể do chưa cấp quyền hoặc đang bị ứng dụng khác chiếm dụng). Bạn có thể dùng nút "Chọn ảnh từ máy" hoặc nhập mã thủ công bên dưới.'
      )
    } finally {
      setCameraLoading(false)
    }
  }

  // Tắt camera
  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
      } catch (err) {
        console.warn('Lỗi khi tắt scanner:', err)
      }
    }
    setIsScanning(false)
  }

  // Quét từ file ảnh
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setScannerError('')
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-region')
      }
      const decodedText = await html5QrCodeRef.current.scanFile(file, true)
      const code = extractCodeFromScan(decodedText)
      setInputCode(code)
      const found = lookupProduct(code)
      setSearchedProduct(found || null)
      setHasSearched(true)
    } catch (err) {
      console.warn('Không đọc được mã từ ảnh:', err)
      setScannerError('Không tìm thấy mã QR trong bức ảnh này. Vui lòng thử lại với ảnh rõ nét hơn.')
    } finally {
      e.target.value = ''
    }
  }

  const handleVerify = (e) => {
    e.preventDefault()
    if (!inputCode.trim()) return
    const found = lookupProduct(inputCode)
    setSearchedProduct(found || null)
    setHasSearched(true)
  }

  return (
    <div className="section section-cream" style={{ minHeight: '80vh', paddingTop: 'calc(var(--navbar-height, 80px) + 2rem)' }}>
      <div className="section-inner" style={{ maxWidth: '680px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Tiêu đề trang */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="section-label">Minh Bạch & Nguồn Gốc</span>
          <h1 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
            Xác Thực Sản Phẩm
          </h1>
          <div className="section-divider" style={{ margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: '520px', margin: '0 auto' }}>
            Quét mã QR qua Camera điện thoại hoặc nhập mã trên thẻ bài để kiểm tra nguồn gốc thủ công chính hãng từ làng nghề Chiếu Nẫu.
          </p>
        </div>

        {/* Khung Camera Quét QR THẬT */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '2px solid rgba(45, 90, 45, 0.25)',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Vùng Viewfinder Camera */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '360px',
              margin: '0 auto',
              display: isScanning ? 'block' : 'none'
            }}
          >
            {/* Div gắn html5-qrcode video element */}
            <div
              id="qr-reader-region"
              style={{
                width: '100%',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#000000'
              }}
            ></div>

            {/* Khung ngắm định vị và hiệu ứng laser quét trực quan */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  width: '220px',
                  height: '220px',
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  borderRadius: '12px',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.35)',
                  position: 'relative'
                }}
              >
                {/* 4 góc căn ngắm */}
                <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid #4a8b4a', borderLeft: '4px solid #4a8b4a', borderTopLeftRadius: '10px' }} />
                <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '4px solid #4a8b4a', borderRight: '4px solid #4a8b4a', borderTopRightRadius: '10px' }} />
                <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #4a8b4a', borderLeft: '4px solid #4a8b4a', borderBottomLeftRadius: '10px' }} />
                <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #4a8b4a', borderRight: '4px solid #4a8b4a', borderBottomRightRadius: '10px' }} />
              </div>
            </div>
          </div>

          {!isScanning ? (
            <div>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  margin: '0 auto 14px auto',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(45, 90, 45, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary, #2d5a2d)'
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="34" height="34">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                  <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                  <rect x="7" y="7" width="10" height="10" rx="1.5"></rect>
                </svg>
              </div>

              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: 'var(--primary-dark)' }}>
                Camera Quét Mã QR Trực Tiếp
              </h3>
              <p style={{ margin: '0 auto 16px auto', fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '400px' }}>
                Bấm nút bên dưới để mở màn hình camera và hướng vào mã QR in trên sản phẩm.
              </p>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={startScanner}
                  disabled={cameraLoading}
                  style={{
                    backgroundColor: 'var(--primary, #2d5a2d)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '11px 22px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    cursor: cameraLoading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(45, 90, 45, 0.3)',
                    opacity: cameraLoading ? 0.75 : 1
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  {cameraLoading ? 'Đang mở màn hình quét...' : 'Mở Camera Quét Mã'}
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    backgroundColor: '#ffffff',
                    color: 'var(--primary, #2d5a2d)',
                    border: '1.5px solid var(--primary, #2d5a2d)',
                    borderRadius: '10px',
                    padding: '11px 18px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  Chọn ảnh từ máy
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '14px' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--primary-dark)', fontWeight: 600, marginBottom: '10px' }}>
                Đang quét... Căn mã QR vào giữa khung hình bên trên
              </p>
              <button
                type="button"
                onClick={stopScanner}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#d32f2f',
                  border: '1.5px solid #d32f2f',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Tắt Màn Hình Quét
              </button>
            </div>
          )}

          {scannerError && (
            <div
              style={{
                marginTop: '14px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(211, 47, 47, 0.08)',
                color: '#d32f2f',
                fontSize: '0.86rem',
                lineHeight: 1.4
              }}
            >
              {scannerError}
            </div>
          )}
        </div>

        {/* Dòng phân cách giữa 2 hình thức */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '2rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--accent, #b5b89a)' }}></div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            Hoặc nhập mã thủ công
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--accent, #b5b89a)' }}></div>
        </div>

        {/* Form nhập mã tay */}
        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Nhập ID (1, 2, 3...) hoặc slug (tui-xach-coi, quat-coi...)"
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid var(--accent, #b5b89a)',
              fontSize: '0.95rem',
              backgroundColor: '#ffffff'
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              backgroundColor: 'var(--primary, #2d5a2d)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Kiểm tra
          </button>
        </form>

        {/* Kết quả xác thực */}
        {hasSearched && (
          <div>
            {searchedProduct ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid rgba(45, 90, 45, 0.2)',
                  padding: '24px',
                  animation: 'fadeInUp 0.3s ease-out'
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(45, 90, 45, 0.1)',
                    color: 'var(--primary, #2d5a2d)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '16px'
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Hàng thật từ Chiếu Nẫu — Đã xác thực
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <img
                    src={searchedProduct.image}
                    alt={searchedProduct.name}
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      border: '1px solid rgba(0,0,0,0.06)'
                    }}
                  />
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--accent-warm)', fontWeight: 600, textTransform: 'uppercase' }}>
                      {searchedProduct.categoryName}
                    </span>
                    <h3 style={{ margin: '4px 0 8px 0', fontSize: '1.25rem', color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
                      {searchedProduct.name}
                    </h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {searchedProduct.shortDesc}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                        {searchedProduct.priceDisplay}
                      </strong>
                      <Link
                        to={`/san-pham/${searchedProduct.slug}`}
                        style={{
                          fontSize: '0.88rem',
                          color: 'var(--primary)',
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}
                      >
                        Xem chi tiết sản phẩm →
                      </Link>
                    </div>
                  </div>
                </div>

                {searchedProduct.specs && searchedProduct.specs.length > 0 && (
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', color: 'var(--primary-dark)' }}>
                      Thông số thủ công:
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                      {searchedProduct.specs.map((spec, i) => (
                        <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <strong>{spec.label}:</strong> {spec.value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  border: '1px solid rgba(212, 115, 138, 0.3)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ color: 'var(--lotus-pink, #d4738a)', marginBottom: '8px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="40" height="40">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--primary-dark)' }}>
                  Không tìm thấy thông tin sản phẩm
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Mã sản phẩm bạn nhập không trùng khớp với dữ liệu thủ công của Chiếu Nẫu. Vui lòng kiểm tra lại mã in trên thẻ bài.
                </p>
                <Link to="/san-pham" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                  Xem danh mục sản phẩm chính hãng →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
