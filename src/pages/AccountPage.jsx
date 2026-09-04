import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCustomerAuth } from '../contexts/CustomerAuthContext'

/* ─── tiny eye icon svg ─── */
const EyeIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
)

/* ─── password strength helper ─── */
function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { level: 1, label: 'Yếu', color: '#ef4444' }
  if (score <= 2) return { level: 2, label: 'Trung bình', color: '#f59e0b' }
  if (score <= 3) return { level: 3, label: 'Khá', color: '#22c55e' }
  return { level: 4, label: 'Mạnh', color: '#16a34a' }
}

/* ─── floating decorative dots ─── */
function FloatingDots() {
  return (
    <div className="auth-floating-dots" aria-hidden="true">
      {[...Array(6)].map((_, i) => (
        <span key={i} className={`auth-dot auth-dot--${i + 1}`} />
      ))}
    </div>
  )
}

export default function AccountPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { customer, isCustomer, loading, login, register, logout } = useCustomerAuth()
  const initialMode = location.pathname === '/dang-ky' ? 'register' : 'login'
  const [mode, setMode] = useState(initialMode)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })

  useEffect(() => {
    setMode(initialMode)
    setError('')
    setSuccess('')
  }, [initialMode])

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const title = useMemo(() => mode === 'register' ? 'Tạo Tài Khoản' : 'Đăng Nhập', [mode])
  const subtitle = useMemo(() =>
    mode === 'register'
      ? 'Tạo tài khoản để lưu thông tin và đặt hàng nhanh hơn.'
      : 'Đăng nhập để quản lý đơn hàng và thông tin cá nhân.',
    [mode]
  )

  const pwStrength = useMemo(() => getPasswordStrength(form.password), [form.password])

  const handleChange = useCallback((event) => {
    setForm(prev => ({ ...prev, [event.target.name]: event.target.value }))
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'register') {
        await register(form)
        setSuccess('Đăng ký thành công! Đang chuyển hướng...')
      } else {
        await login(form.email || form.phone, form.password)
        setSuccess('Đăng nhập thành công!')
      }
      setTimeout(() => navigate('/tai-khoan'), 600)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setError('')
    setSuccess('')
    setShowPw(false)
    navigate(nextMode === 'register' ? '/dang-ky' : '/dang-nhap', { replace: true })
  }

  /* ─── Loading ─── */
  if (loading) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <div className="auth-loading-skeleton">
            <div className="skeleton-circle" />
            <div className="skeleton-line w60" />
            <div className="skeleton-line w80" />
            <div className="skeleton-line w40" />
          </div>
        </div>
      </main>
    )
  }

  /* ─── Profile dashboard ─── */
  if (isCustomer) {
    return (
      <main className="auth-page">
        <FloatingDots />
        <section className={`auth-card auth-card--profile ${mounted ? 'auth-card--visible' : ''}`}>
          <div className="auth-profile-avatar">
            <span>{customer.name?.charAt(0)?.toUpperCase() || 'K'}</span>
          </div>
          <span className="section-label">Tài khoản của bạn</span>
          <h1>Xin chào, {customer.name}! 👋</h1>

          <div className="auth-profile-info">
            <div className="auth-info-item">
              <div className="auth-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <span>Email</span>
                <strong>{customer.email || 'Chưa cập nhật'}</strong>
              </div>
            </div>
            <div className="auth-info-item">
              <div className="auth-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              </div>
              <div>
                <span>Số điện thoại</span>
                <strong>{customer.phone || 'Chưa cập nhật'}</strong>
              </div>
            </div>
          </div>

          <div className="auth-profile-actions">
            <Link to="/quet-ma" className="auth-btn auth-btn--outline" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                <rect x="7" y="7" width="10" height="10" rx="1.5"></rect>
              </svg>
              Quét mã / Xác thực sản phẩm
            </Link>
            <Link to="/san-pham" className="auth-btn auth-btn--primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              Tiếp tục mua sắm
            </Link>
            <button className="auth-btn auth-btn--outline" onClick={logout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Đăng xuất
            </button>
          </div>
        </section>
      </main>
    )
  }

  /* ─── Login / Register form ─── */
  return (
    <main className="auth-page">
      <FloatingDots />
      <section className={`auth-card ${mounted ? 'auth-card--visible' : ''}`}>
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo-mark" style={{ overflow: 'hidden', padding: '3px', background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
            <img src="/logo.png" alt="Chiếu Nẫu Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
          </div>
          <span className="section-label">Tài khoản khách hàng</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs" role="tablist" aria-label="Chọn đăng nhập hoặc đăng ký">
          <button
            className={mode === 'login' ? 'active' : ''}
            onClick={() => switchMode('login')}
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Đăng nhập
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            onClick={() => switchMode('register')}
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            Đăng ký
          </button>
          <div className={`auth-tab-slider ${mode === 'register' ? 'auth-tab-slider--right' : ''}`} />
        </div>

        {/* Messages */}
        {error && (
          <div className="auth-message auth-message--error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {error}
          </div>
        )}
        {success && (
          <div className="auth-message auth-message--success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            {success}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} autoComplete="on">
          {mode === 'register' && (
            <div className="auth-field">
              <label htmlFor="auth-name">Họ và tên</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  required
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">{mode === 'register' ? 'Email' : 'Email hoặc số điện thoại'}</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input
                id="auth-email"
                name="email"
                type={mode === 'register' ? 'email' : 'text'}
                value={form.email}
                onChange={handleChange}
                placeholder={mode === 'register' ? 'email@example.com' : 'email@example.com hoặc 0901234567'}
                required
                autoComplete={mode === 'register' ? 'email' : 'username'}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="auth-field">
              <label htmlFor="auth-phone">Số điện thoại <span className="auth-optional">(tuỳ chọn)</span></label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                <input
                  id="auth-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0901234567"
                  autoComplete="tel"
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-password">Mật khẩu</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              <input
                id="auth-password"
                name="password"
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Tối thiểu 6 ký tự"
                required
                minLength="6"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPw(!showPw)}
                tabIndex={-1}
                aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <EyeIcon open={showPw} />
              </button>
            </div>

            {/* Password strength (register only) */}
            {mode === 'register' && form.password && (
              <div className="auth-pw-strength">
                <div className="auth-pw-bar">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`auth-pw-segment ${i <= pwStrength.level ? 'active' : ''}`}
                      style={i <= pwStrength.level ? { background: pwStrength.color } : {}}
                    />
                  ))}
                </div>
                <span style={{ color: pwStrength.color }}>{pwStrength.label}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="auth-btn auth-btn--submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="auth-spinner" />
                Đang xử lý...
              </>
            ) : (
              <>
                {title}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="auth-footer">
          {mode === 'login' ? (
            <p>Chưa có tài khoản? <button type="button" onClick={() => switchMode('register')}>Đăng ký ngay</button></p>
          ) : (
            <p>Đã có tài khoản? <button type="button" onClick={() => switchMode('login')}>Đăng nhập</button></p>
          )}
        </div>
      </section>
    </main>
  )
}
