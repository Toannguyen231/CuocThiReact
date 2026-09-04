import { Link } from 'react-router-dom'

/**
 * Trang Offline fallback hiển thị khi mất kết nối mạng
 */
export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--cream-light, #faf7f2)',
        color: 'var(--text-primary, #1c1c1c)'
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(212, 165, 116, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          color: 'var(--primary, #2d5a2d)'
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <line x1="12" y1="20" x2="12.01" y2="20"></line>
        </svg>
      </div>

      <h1
        style={{
          fontSize: '2rem',
          fontFamily: 'var(--font-heading, serif)',
          color: 'var(--primary-dark, #1a2e1a)',
          marginBottom: '0.75rem'
        }}
      >
        Không có kết nối mạng
      </h1>

      <p
        style={{
          fontSize: '1rem',
          color: 'var(--text-secondary, #555)',
          maxWidth: '460px',
          lineHeight: 1.5,
          marginBottom: '2rem'
        }}
      >
        Bạn đang ngoại tuyến. Các trang hoặc tài nguyên chưa được lưu trong bộ nhớ tạm tạm thời không khả dụng. Vui lòng kiểm tra lại kết nối Wi-Fi hoặc dữ liệu di động của bạn.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={handleReload}
          className="btn btn-primary"
          style={{
            backgroundColor: 'var(--primary, #2d5a2d)',
            color: '#fff',
            padding: '0.75rem 1.75rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          Thử lại
        </button>

        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.75rem 1.75rem',
            borderRadius: '8px',
            border: '1px solid var(--primary, #2d5a2d)',
            color: 'var(--primary, #2d5a2d)',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: 600,
            backgroundColor: 'transparent'
          }}
        >
          Về Trang chủ
        </Link>
      </div>
    </div>
  )
}
