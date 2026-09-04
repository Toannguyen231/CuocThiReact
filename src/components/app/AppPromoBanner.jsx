import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppMode } from '../../hooks/useAppMode'
import { APP_PROMO } from '../../utils/appPromo'

/**
 * Banner khuyến mãi độc quyền dành riêng cho chế độ App (PWA Standalone)
 * Chỉ render khi isApp = true && !isAdmin
 */
export default function AppPromoBanner() {
  const { isApp } = useAppMode()
  const location = useLocation()
  const [copied, setCopied] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const isAdmin = location.pathname.startsWith('/admin')

  if (!isApp || isAdmin || dismissed) return null

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(APP_PROMO.code)
      } else {
        window.prompt('Sao chép mã ưu đãi độc quyền app:', APP_PROMO.code)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt('Sao chép mã ưu đãi độc quyền app:', APP_PROMO.code)
    }
  }

  return (
    <aside className="app-promo-banner" aria-label="Ưu đãi độc quyền ứng dụng Chiếu Nẫu">
      <div className="app-promo-content">
        <div className="app-promo-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
            <polyline points="20 12 20 22 4 22 4 12"></polyline>
            <rect x="2" y="7" width="20" height="5"></rect>
            <line x1="12" y1="22" x2="12" y2="7"></line>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
          </svg>
        </div>
        <div className="app-promo-text">
          Mở bằng <strong>App Chiếu Nẫu</strong>: Nhập mã <strong>{APP_PROMO.code}</strong> giảm {APP_PROMO.percent}% đơn đầu!
        </div>
      </div>

      <div className="app-promo-actions">
        <button
          type="button"
          onClick={handleCopy}
          className="btn-app-copy-code"
          aria-label="Sao chép mã giảm giá"
        >
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Đã chép
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              {APP_PROMO.code}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="btn-app-dismiss"
          aria-label="Đóng thông báo"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </aside>
  )
}
