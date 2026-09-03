import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useCustomerAuth } from '../contexts/CustomerAuthContext'
import { formatPrice } from '../utils/api'
import AddressMapPicker from '../components/ui/AddressMapPicker'

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart()
  const { customer } = useCustomerAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    note: '',
    paymentMethod: 'cod',
    shippingMethod: 'standard'
  })

  const shippingFee = form.shippingMethod === 'express' ? 30000 : 0
  const grandTotal = cartTotal + shippingFee

  useEffect(() => {
    if (!customer) return
    setForm(current => ({
      ...current,
      customerName: current.customerName || customer.name || '',
      phone: current.phone || customer.phone || '',
      email: current.email || customer.email || ''
    }))
  }, [customer])

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty-page">
          <h2>Giỏ hàng trống</h2>
          <p>Vui lòng thêm sản phẩm trước khi thanh toán.</p>
          <Link to="/san-pham" className="btn-primary-action">Mua sắm ngay →</Link>
        </div>
      </div>
    )
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.customerName || !form.phone || !form.address) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
          subtotal: cartTotal,
          shippingFee,
          total: grandTotal
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Lỗi đặt hàng')
      clearCart()
      navigate(`/dat-hang-thanh-cong/${data.orderId}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cart-page">
      <div className="cart-page-header">
        <h1>💳 Thanh Toán</h1>
        <p>{customer ? `Thông tin đã được điền theo tài khoản ${customer.name}` : 'Đăng nhập hoặc điền thông tin để hoàn tất đơn hàng'}</p>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>Thông tin giao hàng</h3>
          {error && <div className="checkout-error">{error}</div>}

          <div className="form-group">
            <label>Họ và tên *</label>
            <input type="text" name="customerName" value={form.customerName} onChange={handleChange} placeholder="Nguyễn Văn A" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Số điện thoại *</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="0901234567" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
            </div>
          </div>
          <AddressMapPicker
            value={form.address}
            onChange={(newAddress, coords) => {
              setForm(prev => ({
                ...prev,
                address: newAddress,
                ...(coords ? { coords } : {})
              }))
            }}
            required
          />
          <div className="form-group">
            <label>Ghi chú</label>
            <textarea name="note" value={form.note} onChange={handleChange} placeholder="Ghi chú cho đơn hàng (tùy chọn)" rows="2"></textarea>
          </div>

          <h3 className="checkout-section-title">Đơn vị vận chuyển</h3>
          <div className="payment-options">
            <label className={`payment-option ${form.shippingMethod === 'standard' ? 'active' : ''}`}>
              <input type="radio" name="shippingMethod" value="standard" checked={form.shippingMethod === 'standard'} onChange={handleChange} />
              <div>
                <strong>Giao hàng tiêu chuẩn</strong>
                <p>Nhận hàng trong 3-5 ngày làm việc. Miễn phí vận chuyển.</p>
              </div>
              <span className="payment-price">0₫</span>
            </label>
            <label className={`payment-option ${form.shippingMethod === 'express' ? 'active' : ''}`}>
              <input type="radio" name="shippingMethod" value="express" checked={form.shippingMethod === 'express'} onChange={handleChange} />
              <div>
                <strong>Giao nhanh nội thành</strong>
                <p>Ưu tiên đóng gói và giao trong 1-2 ngày làm việc.</p>
              </div>
              <span className="payment-price">30.000₫</span>
            </label>
          </div>

          <h3 className="checkout-section-title">Phương thức thanh toán</h3>
          <div className="payment-options">
            <label className={`payment-option ${form.paymentMethod === 'cod' ? 'active' : ''}`}>
              <input type="radio" name="paymentMethod" value="cod" checked={form.paymentMethod === 'cod'} onChange={handleChange} />
              <div>
                <strong>Thanh toán khi nhận hàng (COD)</strong>
                <p>Thanh toán trực tiếp cho shipper khi nhận hàng.</p>
              </div>
            </label>
            <label className={`payment-option ${form.paymentMethod === 'bank' ? 'active' : ''}`}>
              <input type="radio" name="paymentMethod" value="bank" checked={form.paymentMethod === 'bank'} onChange={handleChange} />
              <div>
                <strong>Chuyển khoản ngân hàng</strong>
                <p>Chuyển khoản trước — thông tin tài khoản sẽ được gửi sau khi đặt hàng.</p>
              </div>
            </label>
          </div>

          <button type="submit" className="btn-place-order" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đặt hàng →'}
          </button>
        </form>

        <div className="checkout-summary">
          <h3>Đơn hàng của bạn</h3>
          <ul className="checkout-items">
            {cart.map(item => (
              <li key={item.id}>
                <img src={item.image} alt={item.name} />
                <div>
                  <span>{item.name}</span>
                  <small>x{item.quantity}</small>
                </div>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </li>
            ))}
          </ul>
          <div className="summary-row summary-row-divider">
            <span>Tạm tính</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Vận chuyển</span>
            <strong>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</strong>
          </div>
          <div className="summary-row summary-total summary-row-strong">
            <span>Tổng cộng:</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{formatPrice(grandTotal)}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
