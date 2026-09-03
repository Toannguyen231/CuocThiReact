import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatPrice, getApiUrl } from '../../utils/api'

const statusLabels = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy'
}

export default function AdminOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrder = () => {
    setLoading(true)
    fetch(getApiUrl(`/api/admin/orders/${id}`), {
      headers: { Authorization: `Bearer ${localStorage.getItem('chieunau_admin_token')}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Không tải được đơn hàng')))
      .then(data => setOrder(data.order))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrder() }, [id])

  const updateStatus = async (status) => {
    const res = await fetch(getApiUrl(`/api/admin/orders/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('chieunau_admin_token')}`
      },
      body: JSON.stringify({ status })
    })
    const data = await res.json()
    if (res.ok) setOrder(data.order)
  }

  if (loading) return <div className="admin-loading">Đang tải...</div>
  if (error || !order) return <div className="admin-empty">{error || 'Không tìm thấy đơn hàng'}</div>

  return (
    <div className="admin-page">
      <div className="admin-page-header admin-page-header-row">
        <div>
          <h1>Đơn hàng #{order.id}</h1>
          <p>{new Date(order.created_at).toLocaleString('vi-VN')}</p>
        </div>
        <Link to="/admin/orders" className="admin-link">Quay lại danh sách</Link>
      </div>

      <div className="admin-detail-grid">
        <section className="admin-section">
          <div className="admin-section-header">
            <h2>Thông tin khách hàng</h2>
            <span className={`status-badge status-${order.status}`}>{statusLabels[order.status]}</span>
          </div>
          <div className="admin-info-list">
            <p><strong>Khách hàng:</strong> {order.customer_name}</p>
            <p><strong>Số điện thoại:</strong> {order.phone}</p>
            <p><strong>Email:</strong> {order.email || 'Không có'}</p>
            <p><strong>Địa chỉ:</strong> {order.address}</p>
            <p><strong>Ghi chú:</strong> {order.note || 'Không có'}</p>
          </div>
          <label className="admin-field">
            <span>Cập nhật trạng thái</span>
            <select value={order.status} onChange={(event) => updateStatus(event.target.value)} className="status-select">
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="admin-section">
          <div className="admin-section-header">
            <h2>Thanh toán</h2>
          </div>
          <div className="admin-info-list">
            <p><strong>Phương thức:</strong> {order.payment_method === 'cod' ? 'COD' : 'Chuyển khoản'}</p>
            <p><strong>Vận chuyển:</strong> {order.shipping_method === 'express' ? 'Giao nhanh' : 'Tiêu chuẩn'}</p>
            <p><strong>Tạm tính:</strong> {formatPrice(order.subtotal || 0)}</p>
            <p><strong>Phí vận chuyển:</strong> {order.shipping_fee ? formatPrice(order.shipping_fee) : 'Miễn phí'}</p>
            <p className="admin-total"><strong>Tổng cộng:</strong> {formatPrice(order.total || 0)}</p>
          </div>
        </section>
      </div>

      <section className="admin-section">
        <div className="admin-section-header">
          <h2>Sản phẩm trong đơn</h2>
        </div>
        <table className="admin-table">
          <thead>
            <tr><th>Sản phẩm</th><th>Giá</th><th>Số lượng</th><th>Tổng</th></tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.productId}>
                <td className="admin-product-cell">
                  <img src={item.image} alt={item.name} />
                  <span>{item.name}</span>
                </td>
                <td>{formatPrice(item.price)}</td>
                <td>{item.quantity}</td>
                <td>{formatPrice(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
