import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import HeroSection from '../components/ui/HeroSection'
import ProductCard from '../components/ui/ProductCard'
import SocialLinks from '../components/ui/SocialLinks'
import { products } from '../data/products'
import { useScrollReveal, useCounter } from '../hooks/useAnimations'

function RevealSection({ className, children, ...props }) {
  const ref = useScrollReveal()
  return <div ref={ref} className={`reveal ${className || ''}`} {...props}>{children}</div>
}

function StatItem({ target, suffix, label }) {
  const ref = useCounter(target, suffix)
  return (
    <div className="stat-item">
      <div className="stat-number" ref={ref}>0</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function Accordion() {
  const [active, setActive] = useState(0)
  const items = [
    { icon: '🌱', title: 'Sứ mệnh', text: 'Gìn giữ và phát triển nghề đan chiếu cói truyền thống của làng Phú Tân, tạo sinh kế bền vững cho bà con địa phương, đồng thời đưa sản phẩm thủ công Việt Nam vươn ra thế giới.' },
    { icon: '🎯', title: 'Tầm nhìn', text: 'Trở thành thương hiệu hàng đầu trong lĩnh vực sản phẩm thủ công từ cói tự nhiên, kết hợp giữa truyền thống và hiện đại, góp phần bảo tồn văn hóa và phát triển kinh tế xanh.' },
    { icon: '💚', title: 'Giá trị bền vững', text: '100% nguyên liệu tự nhiên, quy trình sản xuất thân thiện môi trường. Mỗi sản phẩm không chỉ đẹp mà còn mang ý nghĩa phát triển bền vững cho cộng đồng.' },
    { icon: '🤝', title: 'Cộng đồng', text: 'Tạo việc làm ổn định cho hơn 50 nghệ nhân và phụ nữ tại địa phương, truyền dạy kỹ năng cho thế hệ trẻ, xây dựng mô hình kinh doanh cộng đồng bền vững.' }
  ]

  return (
    <div className="philosophy-content reveal-right">
      {items.map((item, i) => (
        <div key={i} className={`accordion-item ${active === i ? 'active' : ''}`}>
          <div className="accordion-header" onClick={() => setActive(active === i ? -1 : i)}>
            <h3 className="accordion-title">{item.icon} {item.title}</h3>
            <div className="accordion-icon">
              <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
          <div className="accordion-body">
            <p>{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSection
        badge="Thủ công truyền thống Việt Nam"
        title='Gìn Nghề — <em>Giữ Sinh Kế</em>'
        subtitle="Từ một chiếc chiếu truyền thống, chúng tôi tạo nên những sản phẩm mang giá trị mới — gìn giữ nghề xưa, lan tỏa bản sắc văn hóa dân tộc và kiến tạo tương lai xanh."
        image="/assets/images/hero_banner.jpg"
        cta={
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <Link to="/san-pham" className="hero-cta">
              Khám phá sản phẩm
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link
              to="/quet-ma"
              className="hero-cta"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1.5px solid rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                <rect x="7" y="7" width="10" height="10" rx="1.5"></rect>
              </svg>
              Quét mã / Xác thực
            </Link>
          </div>
        }
      />

      {/* Quote Banner */}
      <RevealSection className="quote-banner">
        <p className="quote-text">Từ một chiếc chiếu truyền thống, chúng tôi tạo nên những sản phẩm mang giá trị mới – gìn giữ nghề xưa, lan tỏa bản sắc văn hóa dân tộc và kiến tạo tương lai xanh.</p>
      </RevealSection>

      {/* Products */}
      <section className="section section-cream" id="products">
        <div className="section-inner">
          <RevealSection className="section-header">
            <span className="section-label">Sản phẩm thủ công</span>
            <h2 className="section-title">Hệ Sinh Thái Sản Phẩm</h2>
            <div className="section-divider"></div>
            <p className="section-description">Mỗi sản phẩm là sự kết hợp giữa kỹ thuật đan truyền thống và thiết kế hiện đại, mang đến vẻ đẹp tự nhiên cho cuộc sống hàng ngày.</p>
          </RevealSection>
          <div className="products-grid stagger-children">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section" id="philosophy">
        <div className="section-inner">
          <RevealSection className="section-header">
            <span className="section-label">Triết lý thương hiệu</span>
            <h2 className="section-title">Giá Trị Cốt Lõi</h2>
            <div className="section-divider"></div>
          </RevealSection>
          <div className="philosophy-grid">
            <div className="philosophy-image reveal-left">
              <img src="/assets/images/artisan_weaving.jpg" alt="Nghệ nhân đan chiếu cói" />
            </div>
            <Accordion />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section section-dark">
        <div className="section-inner">
          <div className="stats-grid reveal">
            <StatItem target={50} suffix="+" label="Nghệ nhân" />
            <StatItem target={1000} suffix="+" label="Sản phẩm / tháng" />
            <StatItem target={100} suffix="" label="% Nguyên liệu tự nhiên" />
            <StatItem target={3} suffix=" thế hệ" label="Truyền thống kế thừa" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="contact">
        <RevealSection className="cta-content">
          <span className="section-label" style={{ color: 'var(--accent-gold)' }}>Liên hệ với chúng tôi</span>
          <h2 className="cta-title">Kết Nối Với Chiếu Nẫu</h2>
          <p className="cta-text">Bạn muốn tìm hiểu thêm về sản phẩm hoặc đặt hàng? Hãy liên hệ với chúng tôi qua các kênh bên dưới.</p>
          <SocialLinks />
        </RevealSection>
      </section>
    </>
  )
}
