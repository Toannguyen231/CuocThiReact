import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/* ─── Simple particle background ─── */
function Particles() {
  return (
    <div className="admin-auth-particles" aria-hidden="true">
      {[...Array(20)].map((_, i) => (
        <span
          key={i}
          className="admin-auth-particle"
          style={{
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--size': `${2 + Math.random() * 4}px`,
            '--duration': `${10 + Math.random() * 20}s`,
            '--delay': `${Math.random() * -20}s`,
            '--opacity': `${0.15 + Math.random() * 0.35}`
          }}
        />
      ))}
    </div>
  )
}

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { login, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAdmin) { navigate('/admin'); return }
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [isAdmin, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(username, password)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (isAdmin) return null

  return (
    <div className="admin-auth-page">
      <Particles />

      {/* Decorative background shapes */}
      <div className="admin-auth-bg-shapes" aria-hidden="true">
        <div className="admin-auth-shape admin-auth-shape--1" />
        <div className="admin-auth-shape admin-auth-shape--2" />
        <div className="admin-auth-shape admin-auth-shape--3" />
      </div>

      <div className={`admin-auth-card ${mounted ? 'admin-auth-card--visible' : ''}`}>
        {/* Glassmorphism accent */}
        <div className="admin-auth-glow" aria-hidden="true" />

        {/* Logo */}
        <div className="admin-auth-logo">
          <div className="admin-auth-logo-ring" style={{ background: '#fff', padding: '4px', overflow: 'hidden' }}>
            <img src="/logo.png" alt="Chiếu Nẫu Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
          </div>
        </div>

        {/* Header */}
        <div className="admin-auth-header">
          <h1>Chiếu Nẫu Admin</h1>
          <p>Đăng nhập để quản lý đơn hàng và sản phẩm</p>
        </div>

        {/* Error */}
        {error && (
          <div className="admin-auth-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="admin-auth-form" autoComplete="on">
          <div className="admin-auth-field">
            <label htmlFor="admin-username">Tên đăng nhập</label>
            <div className="admin-auth-input-wrap">
              <svg className="admin-auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="admin-auth-field">
            <label htmlFor="admin-password">Mật khẩu</label>
            <div className="admin-auth-input-wrap">
              <svg className="admin-auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input
                id="admin-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-auth-pw-toggle"
                onClick={() => setShowPw(!showPw)}
                tabIndex={-1}
                aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
                  {showPw ? (
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
              </button>
            </div>
          </div>

          <button type="submit" className="admin-auth-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="admin-auth-spinner" />
                Đang đăng nhập...
              </>
            ) : (
              <>
                Đăng nhập
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Security badge */}
        <div className="admin-auth-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Kết nối được bảo mật bằng SSL
        </div>
      </div>
    </div>
  )
}
