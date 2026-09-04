import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useAppMode } from '../../hooks/useAppMode'

/**
 * Bottom Tab Bar chuẩn app cho chế độ PWA Standalone
 * 5 tabs:
 * 1. Trang chủ (/)
 * 2. Sản phẩm (/san-pham)
 * 3. Câu chuyện (/cau-chuyen)
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

  const tabs = [
    {
      path: '/',
      label: 'Trang chủ',
      isActive: location.pathname === '/' || location.pathname === '/index.html',
      icon: (active) => (
        <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '1' : '2'} width="22" height="22">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    {
      path: '/san-pham',
      label: 'Sản phẩm',
      isActive: location.pathname.startsWith('/san-pham'),
      icon: (active) => (
        <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '1' : '2'} width="22" height="22">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 01-8 0"></path>
        </svg>
      )
    },
    {
      path: '/cau-chuyen',
      label: 'Câu chuyện',
      isActive: location.pathname.startsWith('/cau-chuyen'),
      icon: (active) => (
        <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '1' : '2'} width="22" height="22">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      )
    },
    {
      path: '/gio-hang',
      label: 'Giỏ hàng',
      isActive: location.pathname === '/gio-hang',
      icon: (active) => (
        <div className="app-tab-icon-wrapper">
          <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '1' : '2'} width="22" height="22">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {cartCount > 0 && <span className="app-tab-badge">{cartCount}</span>}
        </div>
      )
    },
    {
      path: '/tai-khoan',
      label: 'Tài khoản',
      isActive: location.pathname === '/tai-khoan' || location.pathname === '/dang-nhap' || location.pathname === '/dang-ky',
      icon: (active) => (
        <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '1' : '2'} width="22" height="22">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    }
  ]

  return (
    <nav className="app-bottom-tab-bar" aria-label="Điều hướng chính ứng dụng Chiếu Nẫu">
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          to={tab.path}
          className={`app-tab-item ${tab.isActive ? 'active' : ''}`}
          aria-label={tab.label}
        >
          {tab.icon(tab.isActive)}
          <span>{tab.label}</span>
        </Link>
      ))}
    </nav>
  )
}
