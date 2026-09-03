import { Link } from 'react-router-dom'
import SocialLinks from '../ui/SocialLinks'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path fill="#1c1c1c" d="M0,60 C360,20 720,80 1080,40 C1260,20 1380,40 1440,30 L1440,80 L0,80 Z"></path>
        </svg>
      </div>
      <div className="footer-main">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
            <img src="/logo.png" alt="Chiếu Nẫu Logo" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'contain', background: '#fff', padding: '2px', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }} />
            <h3 style={{ margin: 0 }}>Chiếu Nẫu</h3>
          </div>
          <p>Gìn Nghề — Giữ Sinh Kế. Từ chiếc chiếu truyền thống, chúng tôi tạo nên những sản phẩm thủ công mang giá trị văn hóa và phát triển bền vững.</p>
          <SocialLinks small />
        </div>
        <div className="footer-nav">
          <h4>Điều hướng</h4>
          <ul className="footer-links">
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/cau-chuyen">Câu chuyện</Link></li>
            <li><Link to="/san-pham">Sản phẩm</Link></li>
            <li><Link to="/qua-tang-doanh-nghiep">Quà doanh nghiệp</Link></li>
            <li><Link to="/tac-dong-xa-hoi">Tác động xã hội</Link></li>
            <li><Link to="/cam-nang">Cẩm nang</Link></li>
          </ul>
        </div>
        <div className="footer-info">
          <h4>Liên hệ</h4>
          <ul className="footer-contact">
            <li>
              <span className="footer-contact-icon">📍</span>
              <span>Làng nghề Phú Tân, An Giang, Việt Nam</span>
            </li>
            <li>
              <span className="footer-contact-icon">📧</span>
              <span><a href="mailto:lienhe.chieunau@gmail.com" style={{ color: 'inherit' }}>lienhe.chieunau@gmail.com</a></span>
            </li>
            <li>
              <span className="footer-contact-icon">🌐</span>
              <span><a href="https://www.facebook.com/search/top/?q=Chi%E1%BA%BFu%20N%E1%BA%ABu" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>Chiếu Nẫu Official</a></span>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 Chiếu Nẫu — Gìn Nghề Giữ Sinh Kế. Bảo lưu mọi quyền.</p>
      </div>
    </footer>
  )
}
