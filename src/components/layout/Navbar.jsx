import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useCustomerAuth } from '../../contexts/CustomerAuthContext'

const navItems = [
  { path: '/', label: 'Trang chủ' },
  { path: '/cau-chuyen', label: 'Câu chuyện' },
  { path: '/san-pham', label: 'Sản phẩm' },
  { path: '/qua-tang-doanh-nghiep', label: 'Quà doanh nghiệp' },
  { path: '/tac-dong-xa-hoi', label: 'Tác động xã hội' },
  { path: '/cam-nang', label: 'Cẩm nang' }
]

export default function Navbar({ solid = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { cartCount, openDrawer } = useCart()
  const { customer } = useCustomerAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(solid || window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [solid])

  useEffect(() => {
    setMenuOpen(false)
    document.body.style.overflow = ''
  }, [location])

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
    document.body.style.overflow = !menuOpen ? 'hidden' : ''
  }

  return (
    <nav className={`navbar ${scrolled || solid ? 'scrolled' : ''}`} id="navbar">
      <Link to="/" className="nav-brand">
        <img src="/logo.png" alt="Chiếu Nẫu Logo" className="nav-logo-img" />
        <div className="nav-brand-text">
          Chiếu Nẫu
          <span>Gìn Nghề — Giữ Sinh Kế</span>
        </div>
      </Link>

      <div className={`nav-links ${menuOpen ? 'active' : ''}`} id="navLinks">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="nav-actions">
        {/* Nút Quét QR nhanh trên thanh điều hướng */}
        <Link className="nav-qr-btn" to="/quet-ma" aria-label="Xác thực nguồn gốc & Quét QR" title="Quét mã xác thực sản phẩm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
            <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
            <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
            <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
            <rect x="7" y="7" width="10" height="10" rx="1.5"></rect>
          </svg>
        </Link>

        <Link className="account-icon-btn" to={customer ? '/tai-khoan' : '/dang-nhap'} aria-label={customer ? 'Tài khoản' : 'Đăng nhập'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="21" height="21">
            <path d="M20 21a8 8 0 10-16 0" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {customer && <span className="account-dot" aria-hidden="true"></span>}
        </Link>

        <button className="cart-icon-btn" onClick={openDrawer} aria-label="Giỏ hàng">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>

        <div className={`nav-hamburger ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  )
}
