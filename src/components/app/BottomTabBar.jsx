import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useAppMode } from '../../hooks/useAppMode'

/**
 * Bottom Tab Bar chuẩn app cho chế độ PWA Standalone
 * 5 tabs thiết kế cân đối:
 * 1. Trang chủ (/)
 * 2. Sản phẩm (/san-pham)
 * 3. Quét QR (/quet-ma) - Nút trung tâm nổi bật, dễ bấm
 * 4. Giỏ hàng (/gio-hang) có badge số lượng
 * 5. Tài khoản (/tai-khoan)
 */
export default function BottomTabBar() {
  const { isApp } = useAppMode()
  const location = useLocation()
  const { cartCount } = useCart()

  const isAdmin = location.pathname.startsWith('/admin')

  // Chỉ hiển thị khi đang chạy ở chế độ App và không nằm trong khu vực Admin
  if (!isApp || isAdmin) return null

  const isHome = location.pathname === '/' || location.pathname === '/index.html'
  const isProducts = location.pathname.startsWith('/san-pham')
  const isScan = location.pathname.startsWith('/quet-ma')
  const isCart = location.pathname === '/gio-hang'
  const isAccount = location.pathname === '/tai-khoan' || location.pathname === '/dang-nhap' || location.pathname === '/dang-ky'

  return (
    <nav className="app-bottom-tab-bar" aria-label="Điều hướng chính ứng dụng Chiếu Nẫu">
      {/* 1. Trang chủ */}
      <Link to="/" className={`app-tab-item ${isHome ? 'active' : ''}`} aria-label="Trang chủ">
        <svg viewBox="0 0 24 24" fill={isHome ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isHome ? '1' : '2'} width="22" height="22">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Trang chủ</span>
      </Link>

      {/* 2. Sản phẩm */}
      <Link to="/san-pham" className={`app-tab-item ${isProducts ? 'active' : ''}`} aria-label="Sản phẩm">
        <svg viewBox="0 0 24 24" fill={isProducts ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isProducts ? '1' : '2'} width="22" height="22">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 01-8 0"></path>
        </svg>
        <span>Sản phẩm</span>
      </Link>

      {/* 3. Nút Quét QR Nổi Bật Ở Giữa (Scan & Verify) */}
      <Link to="/quet-ma" className={`app-tab-item app-tab-scan-center ${isScan ? 'active' : ''}`} aria-label="Quét mã QR">
        <div className="app-tab-scan-bubble">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="22" height="22">
            <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
            <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
            <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
            <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
            <rect x="7" y="7" width="10" height="10" rx="1.5"></rect>
          </svg>
        </div>
        <span>Quét QR</span>
      </Link>

      {/* 4. Giỏ hàng */}
      <Link to="/gio-hang" className={`app-tab-item ${isCart ? 'active' : ''}`} aria-label="Giỏ hàng">
        <div className="app-tab-icon-wrapper">
          <svg viewBox="0 0 24 24" fill={isCart ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isCart ? '1' : '2'} width="22" height="22">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {cartCount > 0 && <span className="app-tab-badge">{cartCount}</span>}
        </div>
        <span>Giỏ hàng</span>
      </Link>

      {/* 5. Tài khoản */}
      <Link to="/tai-khoan" className={`app-tab-item ${isAccount ? 'active' : ''}`} aria-label="Tài khoản">
        <svg viewBox="0 0 24 24" fill={isAccount ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isAccount ? '1' : '2'} width="22" height="22">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>Tài khoản</span>
      </Link>
    </nav>
  )
}
