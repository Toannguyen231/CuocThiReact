import { useParams, useLocation, Link } from 'react-router-dom'
import { formatPrice } from '../utils/api'

export default function OrderSuccessPage() {
  const { id } = useParams()
  const location = useLocation()
  const orderData = location.state?.order

  return (
    <div className="cart-page">
      <div className="order-success">
        <div className="success-icon">✅</div>
        <h1>Đặt Hàng Thành Công!</h1>
        <p className="order-id">Mã đơn hàng: <strong>#{id}</strong></p>
        {orderData && (
          <div style={{ margin: '1rem 0', padding: '0.85rem 1.25rem', background: 'rgba(45, 90, 45, 0.08)', borderRadius: '10px', display: 'inline-block' }}>
            <span>Tổng thanh toán: </span>
            <strong style={{ color: 'var(--primary, #2d5a2d)', fontSize: '1.2rem' }}>
              {formatPrice(orderData.total)}
            </strong>
            {orderData.voucher_code && (
              <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '4px' }}>
                (Đã áp dụng mã {orderData.voucher_code} - Giảm {formatPrice(orderData.discount_amount || 0)})
              </div>
            )}
          </div>
        )}
        <p>Cảm ơn bạn đã tin tưởng Chiếu Nẫu. Chúng tôi sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất.</p>
        
        <div className="order-success-info">
          <div className="info-card">
            <h4>📞 Xác nhận đơn hàng</h4>
            <p>Chúng tôi sẽ gọi điện xác nhận trong vòng 24 giờ.</p>
          </div>
          <div className="info-card">
            <h4>📦 Giao hàng</h4>
            <p>Đơn hàng sẽ được giao trong 3-5 ngày làm việc.</p>
          </div>
          <div className="info-card">
            <h4>💬 Hỗ trợ</h4>
            <p>Liên hệ: <a href="mailto:lienhe.chieunau@gmail.com">lienhe.chieunau@gmail.com</a></p>
          </div>
        </div>

        <div className="order-success-actions">
          <Link to="/" className="btn-back-home">← Về trang chủ</Link>
          <Link to="/san-pham" className="btn-primary-action">Tiếp tục mua sắm</Link>
        </div>
      </div>
    </div>
  )
}
