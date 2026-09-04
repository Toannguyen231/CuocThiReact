import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { usePWAInstall } from '../../hooks/usePWAInstall'

const HIDE_BANNER_KEY = 'chieu_nau_pwa_banner_hidden_until'
const HIDE_DAYS = 7

/**
 * Banner nhắc người dùng cài đặt PWA "Chiếu Nẫu"
 * - Chỉ hiện khi canInstall = true
 * - Không hiển thị ở trang /admin
 * - Lưu trạng thái ẩn 7 ngày trong localStorage nếu người dùng chọn "Để sau"
 */
export default function PWAInstallBanner() {
  const { canInstall, promptInstall } = usePWAInstall()
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)

  const isAdmin = location.pathname.startsWith('/admin')

  useEffect(() => {
    // Kiểm tra xem người dùng có chọn "Để sau" trước đó không
    const hiddenUntil = localStorage.getItem(HIDE_BANNER_KEY)
    const isTemporarilyHidden = hiddenUntil && Date.now() < parseInt(hiddenUntil, 10)

    if (canInstall && !isAdmin && !isTemporarilyHidden) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [canInstall, isAdmin])

  const handleInstallClick = async () => {
    const installed = await promptInstall()
    if (installed) {
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    // Ẩn trong vòng 7 ngày
    const expireTime = Date.now() + HIDE_DAYS * 24 * 60 * 60 * 1000
    localStorage.setItem(HIDE_BANNER_KEY, expireTime.toString())
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div
      role="region"
      aria-label="Cài đặt ứng dụng Chiếu Nẫu"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        maxWidth: '420px',
        zIndex: 9990,
        backgroundColor: 'var(--cream-light, #faf7f2)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-lg, 0 8px 40px rgba(0,0,0,0.16))',
        border: '1px solid var(--accent, #b5b89a)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        animation: 'fadeInUp 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img
          src="/pwa-192x192.png"
          alt="Chiếu Nẫu Logo"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            objectFit: 'cover',
            border: '1px solid rgba(45, 90, 45, 0.15)',
            flexShrink: 0
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              margin: '0 0 4px 0',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--primary-dark, #1a2e1a)',
              fontFamily: 'var(--font-heading, serif)'
            }}
          >
            Cài app Chiếu Nẫu
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: '0.85rem',
              color: 'var(--text-secondary, #555)',
              lineHeight: 1.3
            }}
          >
            Trải nghiệm mượt mà, mua sắm nhanh hơn và mở ngay từ màn hình chính!
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-light, #888)',
            fontSize: '0.85rem',
            padding: '8px 12px',
            cursor: 'pointer',
            borderRadius: '8px',
            fontWeight: 500,
            transition: 'color 0.2s'
          }}
        >
          Để sau
        </button>
        <button
          type="button"
          onClick={handleInstallClick}
          style={{
            backgroundColor: 'var(--primary, #2d5a2d)',
            color: '#fff',
            border: 'none',
            fontSize: '0.85rem',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: 'var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.08))',
            transition: 'background-color 0.2s'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Cài đặt ngay
        </button>
      </div>
    </div>
  )
}
