import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice, getApiUrl } from '../../utils/api'

const statusLabels = { pending: 'Chờ xử lý', confirmed: 'Đã xác nhận', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' }
const statusFilters = ['all', 'pending', 'confirmed', 'shipping', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const fetchOrders = () => {
    const url = filter === 'all' ? getApiUrl('/api/admin/orders') : getApiUrl(`/api/admin/orders?status=${filter}`)
    fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('chieunau_admin_token')}` } })
      .then(res => res.json())
      .then(data => { setOrders(data.orders || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [filter])

  const updateStatus = async (id, status) => {
    await fetch(getApiUrl(`/api/admin/orders/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('chieunau_admin_token')}` },
      body: JSON.stringify({ status })
    })
    fetchOrders()
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>📦 Quản Lý Đơn Hàng</h1>
        <p>{orders.length} đơn hàng</p>
      </div>

      <div className="admin-filter-bar">
        {statusFilters.map(s => (
          <button key={s} className={`admin-filter-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s === 'all' ? 'Tất cả' : statusLabels[s]}
          </button>
        ))}
      </div>

      {loading ? <div className="admin-loading">Đang tải...</div> : (
        <table className="admin-table">
          <thead>
            <tr><th>Mã</th><th>Khách hàng</th><th>SĐT</th><th>Tổng</th><th>Thanh toán</th><th>Trạng thái</th><th>Ngày</th><th>Hành động</th></tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td><Link to={`/admin/orders/${order.id}`}>#{order.id}</Link></td>
                <td>{order.customer_name}</td>
                <td>{order.phone}</td>
                <td>{formatPrice(order.total)}</td>
                <td>{order.payment_method === 'cod' ? 'COD' : 'Chuyển khoản'}</td>
                <td><span className={`status-badge status-${order.status}`}>{statusLabels[order.status]}</span></td>
                <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                <td>
                  <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className="status-select">
                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan="8" className="admin-empty">Không có đơn hàng nào.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  )
}
