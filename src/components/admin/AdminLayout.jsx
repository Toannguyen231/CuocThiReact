import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminLayout() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <img src="/logo.png" alt="Chiếu Nẫu Logo" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'contain', background: '#fff', padding: '2px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }} />
          <div>
            <h3>Chiếu Nẫu</h3>
            <small>Admin Panel</small>
          </div>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            📦 Đơn hàng
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            🛍️ Sản phẩm
          </NavLink>
          <NavLink to="/admin/chat" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            💬 Tin nhắn Live Chat
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            👥 Quản lý tài khoản
          </NavLink>
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <span>👤 {admin?.username}</span>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>Đăng xuất</button>
          <a href="/" className="admin-back-link" target="_blank" rel="noopener noreferrer">🌐 Xem website</a>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
