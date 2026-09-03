import HeroSection from '../components/ui/HeroSection'
import SocialLinks from '../components/ui/SocialLinks'
import { useScrollReveal, useCounter } from '../hooks/useAnimations'

function Reveal({ className, children }) {
  const ref = useScrollReveal()
  return <div ref={ref} className={`reveal ${className || ''}`}>{children}</div>
}

function ImpactStat({ target, suffix, label, icon }) {
  const ref = useCounter(target, suffix)
  return (
    <div className="impact-card">
      <div className="impact-icon">{icon}</div>
      <div className="impact-number" ref={ref}>0</div>
      <div className="impact-label">{label}</div>
    </div>
  )
}

export default function SocialImpactPage() {
  return (
    <>
      <HeroSection
        badge="Social Impact & ESG"
        title='Tác Động <em>Xã Hội</em>'
        subtitle="Mỗi sản phẩm Chiếu Nẫu không chỉ mang giá trị thẩm mỹ — mà còn là động lực thay đổi cuộc sống cộng đồng nghệ nhân."
        image="/assets/images/hero_social_impact.jpg"
        inner
      />

      <section className="section section-cream">
        <div className="section-inner">
          <Reveal className="section-header">
            <span className="section-label">Con số ấn tượng</span>
            <h2 className="section-title">Tác Động Thực Tế</h2>
            <div className="section-divider"></div>
          </Reveal>
          <div className="impact-grid stagger-children">
            <ImpactStat target={50} suffix="+" label="Nghệ nhân được hỗ trợ" icon="👩‍🎨" />
            <ImpactStat target={35} suffix="%" label="Thu nhập tăng" icon="📈" />
            <ImpactStat target={100} suffix="%" label="Phân hủy sinh học" icon="♻️" />
            <ImpactStat target={3} suffix=" thế hệ" label="Kế thừa nghề" icon="🤝" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <Reveal className="section-header">
            <span className="section-label">Nghệ nhân tiêu biểu</span>
            <h2 className="section-title">Câu Chuyện Nghệ Nhân</h2>
            <div className="section-divider"></div>
          </Reveal>
          <div className="philosophy-grid">
            <div className="philosophy-image reveal-left">
              <img src="/assets/images/artisan_portrait.jpg" alt="Cô Nguyễn Thị Hoa - Nghệ nhân" />
            </div>
            <div className="philosophy-content reveal-right">
              <div className="story-text-block">
                <h3>Cô Nguyễn Thị Hoa</h3>
                <p style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Nghệ nhân đan cói — 25 năm kinh nghiệm</p>
                <p style={{ marginTop: '1rem' }}>"Ngày trước tôi chỉ biết đan chiếu. Giờ nhờ Chiếu Nẫu, tôi biết đan túi xách, quạt cói, có thêm thu nhập nuôi con ăn học. Mỗi sản phẩm ra đời là niềm vui, là tự hào của tôi."</p>
                <div className="artisan-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
                  <div style={{ textAlign: 'center' }}><strong style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>25</strong><br/><small>Năm kinh nghiệm</small></div>
                  <div style={{ textAlign: 'center' }}><strong style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>500+</strong><br/><small>Sản phẩm/năm</small></div>
                  <div style={{ textAlign: 'center' }}><strong style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>3</strong><br/><small>Học viên đào tạo</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="section-inner">
          <Reveal className="section-header">
            <span className="section-label">ESG Framework</span>
            <h2 className="section-title">Ba Trụ Cột ESG</h2>
            <div className="section-divider"></div>
          </Reveal>
          <div className="values-grid stagger-children">
            <div className="value-card"><div className="value-icon">🌍</div><h3>Environment</h3><p>100% nguyên liệu tự nhiên, phân hủy sinh học. Quy trình sản xuất không phát thải, không hóa chất độc hại.</p></div>
            <div className="value-card"><div className="value-icon">👥</div><h3>Social</h3><p>Tạo việc làm cho 50+ phụ nữ nông thôn, tăng thu nhập 35%, đào tạo nghề cho thế hệ trẻ.</p></div>
            <div className="value-card"><div className="value-icon">⚖️</div><h3>Governance</h3><p>Mô hình kinh doanh minh bạch, Fair Trade, chia sẻ lợi nhuận công bằng với nghệ nhân.</p></div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <Reveal className="cta-content">
          <span className="section-label" style={{ color: 'var(--accent-gold)' }}>Đồng hành</span>
          <h2 className="cta-title">Cùng Tạo Tác Động Tích Cực</h2>
          <p className="cta-text">Mỗi sản phẩm bạn chọn là một đóng góp cho sự phát triển bền vững của cộng đồng nghệ nhân.</p>
          <SocialLinks />
        </Reveal>
      </section>
    </>
  )
}
