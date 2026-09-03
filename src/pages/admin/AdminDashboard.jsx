import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/api'
import RevenueBarChart from '../../components/admin/RevenueBarChart'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('chieunau_admin_token')}` }
    })
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="admin-loading">Đang tải...</div>

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>📊 Dashboard</h1>
        <p>Tổng quan hoạt động kinh doanh</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card stat-revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{stats ? formatPrice(stats.totalRevenue || 0) : '...'}</h3>
            <p>Tổng doanh thu</p>
          </div>
        </div>
        <div className="admin-stat-card stat-orders">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{stats?.totalOrders || 0}</h3>
            <p>Tổng đơn hàng</p>
          </div>
        </div>
        <div className="admin-stat-card stat-pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats?.pendingOrders || 0}</h3>
            <p>Chờ xử lý</p>
          </div>
        </div>
        <div className="admin-stat-card stat-products">
          <div className="stat-icon">🛍️</div>
          <div className="stat-info">
            <h3>{stats?.totalProducts || 0}</h3>
            <p>Sản phẩm</p>
          </div>
        </div>
      </div>

      {/* ─── Revenue Bar / Column Chart Section ─── */}
      <RevenueBarChart chartData={stats?.charts} />

      <div className="admin-section">
        <div className="admin-section-header">
          <h2>Đơn hàng gần đây</h2>
          <Link to="/admin/orders" className="admin-link">Xem tất cả →</Link>
        </div>
        {stats?.recentOrders?.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr><th>Mã</th><th>Khách hàng</th><th>Tổng</th><th>Trạng thái</th><th>Ngày</th></tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(order => (
                <tr key={order.id}>
                  <td><Link to={`/admin/orders/${order.id}`}>#{order.id}</Link></td>
                  <td>{order.customer_name}</td>
                  <td>{formatPrice(order.total)}</td>
                  <td><span className={`status-badge status-${order.status}`}>{statusLabels[order.status] || order.status}</span></td>
                  <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="admin-empty">Chưa có đơn hàng nào.</p>
        )}
      </div>
    </div>
  )
}

const statusLabels = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy'
}
