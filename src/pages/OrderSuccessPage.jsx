import { useParams, Link } from 'react-router-dom'

export default function OrderSuccessPage() {
  const { id } = useParams()

  return (
    <div className="cart-page">
      <div className="order-success">
        <div className="success-icon">✅</div>
        <h1>Đặt Hàng Thành Công!</h1>
        <p className="order-id">Mã đơn hàng: <strong>#{id}</strong></p>
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
