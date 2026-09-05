import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useCustomerAuth } from '../contexts/CustomerAuthContext'
import { useAppMode } from '../hooks/useAppMode'
import { APP_PROMO } from '../utils/appPromo'
import { formatPrice, getApiUrl } from '../utils/api'
import AddressMapPicker from '../components/ui/AddressMapPicker'

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart()
  const { customer } = useCustomerAuth()
  const { isApp } = useAppMode()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true))
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    note: '',
    paymentMethod: 'cod',
    shippingMethod: 'standard'
  })

  // Lắng nghe trạng thái kết nối mạng (online/offline)
  // TODO Phase 2: Nâng cấp Background Sync Queue đơn hàng khi offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Quản lý voucher giảm giá độc quyền app & khuyến mãi động (Phase 2)
  const [voucherInput, setVoucherInput] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(null)
  const [voucherError, setVoucherError] = useState('')
  const [checkingVoucher, setCheckingVoucher] = useState(false)

  const shippingFee = form.shippingMethod === 'express' ? 30000 : 0

  // Tính số tiền giảm giá động từ kết quả server kiểm tra
  const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0
  const grandTotal = Math.max(0, cartTotal - discountAmount + shippingFee)

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

  const handleApplyVoucher = async (e) => {
    e.preventDefault()
    setVoucherError('')
    const cleanCode = voucherInput.trim().toUpperCase()

    if (!cleanCode) {
      setVoucherError('Vui lòng nhập mã ưu đãi.')
      return
    }

    setCheckingVoucher(true)
    try {
      const res = await fetch(getApiUrl('/api/vouchers/check'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: cleanCode,
          subtotal: cartTotal,
          isApp,
          phone: form.phone,
          email: form.email
        })
      })
      const data = await res.json()
      if (res.ok && data.valid) {
        setAppliedVoucher({
          code: data.voucher.code,
          description: data.voucher.description,
          discountAmount: data.voucher.discountAmount,
          discountPercent: data.voucher.discountPercent,
          appOnly: data.voucher.appOnly
        })
        setVoucherError('')
      } else {
        setVoucherError(data.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.')
      }
    } catch {
      setVoucherError('Không thể kiểm tra mã giảm giá lúc này.')
    } finally {
      setCheckingVoucher(false)
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherInput('')
    setVoucherError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!navigator.onLine) {
      setError('Bạn đang ngoại tuyến. Vui lòng kết nối mạng để đặt hàng.')
      return
    }
    if (!form.customerName || !form.phone || !form.address) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.')
      return
    }
    setLoading(true)
    setError('')
    try {
      // Ghi chú voucher vào đơn nếu có
      const finalNote = appliedVoucher
        ? `${form.note ? form.note + ' | ' : ''}[App Promo: ${appliedVoucher.code} - Giảm ${formatPrice(discountAmount)}]`
        : form.note

      let res
      try {
        res = await fetch(getApiUrl('/api/orders'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            note: finalNote,
            voucherCode: appliedVoucher ? appliedVoucher.code : null,
            discount: discountAmount,
            items: cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
            subtotal: cartTotal,
            shippingFee,
            total: grandTotal
          })
        })
      } catch (fetchErr) {
        // Bắt lỗi rớt mạng hoặc server offline
        throw new Error('Bạn đang ngoại tuyến hoặc không thể kết nối tới máy chủ. Vui lòng kiểm tra lại mạng.')
      }

      const data = await res.json()
      if (!res.ok) {
        // Nếu lỗi liên quan đến voucher từ backend, hiển thị vào voucherError thay vì crash submit
        if (res.status === 400 && data.message && data.message.toLowerCase().includes('mã giảm giá')) {
          setVoucherError(data.message)
          setAppliedVoucher(null)
          return
        }
        throw new Error(data.message || 'Lỗi đặt hàng')
      }

      clearCart()
      // Truyền dữ liệu order thực tế từ backend để trang success hiển thị giá chính xác tuyệt đối
      navigate(`/dat-hang-thanh-cong/${data.orderId}`, {
        state: { order: data.order }
      })
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

          {!isOnline && (
            <div style={{
              backgroundColor: '#fff3cd',
              color: '#856404',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.88rem',
              border: '1px solid #ffeeba',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              <span>Bạn đang ngoại tuyến. Vui lòng kết nối mạng để hoàn tất đặt hàng.</span>
            </div>
          )}

          <button type="submit" className="btn-place-order" disabled={loading || !isOnline}>
            {loading ? 'Đang xử lý...' : !isOnline ? 'Đang ngoại tuyến' : 'Đặt hàng →'}
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

          {/* Ô nhập mã ưu đãi */}
          <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed var(--accent, #b5b89a)' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px', color: 'var(--primary-dark)' }}>
              Mã ưu đãi
            </label>
            {!appliedVoucher ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                  placeholder={isApp ? 'Nhập APP10' : 'Mã giảm giá (nếu có)'}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase'
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  disabled={checkingVoucher}
                  style={{
                    backgroundColor: 'var(--primary, #2d5a2d)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: checkingVoucher ? 'not-allowed' : 'pointer',
                    opacity: checkingVoucher ? 0.7 : 1
                  }}
                >
                  {checkingVoucher ? 'Đang kiểm tra...' : 'Áp dụng'}
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(45, 90, 45, 0.08)',
                  border: '1px solid var(--primary, #2d5a2d)',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              >
                <div>
                  <strong style={{ color: 'var(--primary, #2d5a2d)', fontSize: '0.9rem' }}>
                    {appliedVoucher.code}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                    ({appliedVoucher.description || 'Đã áp dụng giảm giá'})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#d4738a',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.82rem'
                  }}
                >
                  Gỡ bỏ
                </button>
              </div>
            )}
            {voucherError && (
              <p style={{ color: '#d32f2f', fontSize: '0.82rem', marginTop: '6px', marginBottom: 0 }}>
                {voucherError}
              </p>
            )}
          </div>

          <div className="summary-row summary-row-divider">
            <span>Tạm tính</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>

          {appliedVoucher && (
            <div className="summary-row" style={{ color: 'var(--primary, #2d5a2d)' }}>
              <span>
                Mã {appliedVoucher.code}
                {appliedVoucher.discountPercent ? ` (−${appliedVoucher.discountPercent}%)` : ''}
              </span>
              <strong>−{formatPrice(discountAmount)}</strong>
            </div>
          )}

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
