import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Toast thông báo phiên bản mới của PWA Chiếu Nẫu
 * Dùng useRegisterSW với reloadPrompt để người dùng chủ động bấm Cập nhật
 */
export default function PWAUpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log('Service Worker đã đăng ký thành công:', swUrl)
    },
    onRegisterError(error) {
      console.warn('Đăng ký Service Worker thất bại:', error)
    }
  })

  if (!needRefresh) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        maxWidth: '380px',
        zIndex: 9995,
        backgroundColor: 'var(--primary-dark, #1a2e1a)',
        color: '#ffffff',
        borderRadius: '14px',
        boxShadow: 'var(--shadow-xl, 0 12px 60px rgba(0,0,0,0.2))',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        border: '1px solid var(--accent-gold, #c9a96e)',
        animation: 'fadeInUp 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            backgroundColor: 'var(--primary, #2d5a2d)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-warm, #d4a574)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </div>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
            Bản cập nhật mới đã sẵn sàng!
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.35 }}>
            Ứng dụng Chiếu Nẫu vừa có phiên bản cải tiến mới. Vui lòng tải lại để sử dụng tính năng mới nhất.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.85rem',
            padding: '6px 12px',
            cursor: 'pointer',
            borderRadius: '6px',
            fontWeight: 500
          }}
        >
          Để sau
        </button>
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          style={{
            backgroundColor: 'var(--accent-warm, #d4a574)',
            color: '#1a2e1a',
            border: 'none',
            fontSize: '0.85rem',
            padding: '6px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 700,
            transition: 'opacity 0.2s'
          }}
        >
          Cập nhật ngay
        </button>
      </div>
    </div>
  )
}
