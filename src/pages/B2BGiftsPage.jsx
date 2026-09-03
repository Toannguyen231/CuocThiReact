import HeroSection from '../components/ui/HeroSection'
import SocialLinks from '../components/ui/SocialLinks'
import { giftSets } from '../data/products'
import { useCart } from '../contexts/CartContext'
import { useScrollReveal } from '../hooks/useAnimations'

function Reveal({ className, children }) {
  const ref = useScrollReveal()
  return <div ref={ref} className={`reveal ${className || ''}`}>{children}</div>
}

export default function B2BGiftsPage() {
  const { addToCart } = useCart()

  return (
    <>
      <HeroSection
        badge="B2B Corporate Gifts"
        title='Giải Pháp Quà Tặng Xanh<br/><em>Cho Doanh Nghiệp</em>'
        subtitle="Tinh hoa làng nghề Việt — mỗi phần quà là một câu chuyện bền vững, mang thông điệp xanh đến đối tác và khách hàng của bạn."
        image="/assets/images/hero_b2b_gifts.jpg"
        inner
        className="hero-b2b"
      />

      <div className="quote-banner reveal">
        <p className="quote-text">Mỗi phần quà từ Chiếu Nẫu không chỉ là một món quà — mà là câu chuyện về nghệ nhân, về làng nghề, và về cam kết phát triển bền vững của doanh nghiệp bạn.</p>
      </div>

      <section className="section section-cream">
        <div className="section-inner">
          <Reveal className="section-header">
            <span className="section-label">Bộ sưu tập quà tặng</span>
            <h2 className="section-title">Bộ Quà Tặng Doanh Nghiệp</h2>
            <div className="section-divider"></div>
            <p className="section-description">Ba bộ quà tặng được thiết kế riêng cho doanh nghiệp, kết hợp tinh hoa thủ công với đóng gói sinh thái cao cấp.</p>
          </Reveal>

          <div className="gift-sets-grid stagger-children">
            {giftSets.map(set => (
              <div key={set.id} className="gift-set-card">
                <div className="gift-set-image">
                  <img src={set.image} alt={set.name} loading="lazy" />
                  <div className="gift-set-badge">{set.badge}</div>
                </div>
                <div className="gift-set-body">
                  <h3 className="gift-set-name">{set.name}</h3>
                  <ul className="gift-set-items">
                    {set.items.map((item, i) => <li key={i}><span className="gift-set-check">✓</span> {item}</li>)}
                  </ul>
                  <div className="gift-set-footer">
                    <span className="gift-set-price">{set.priceDisplay}</span>
                    <button className="btn-add-to-cart-sm" onClick={() => addToCart({ id: set.id, name: set.name, price: set.price, image: set.image, slug: set.slug })}>
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <Reveal className="section-header">
            <span className="section-label">Dịch vụ tùy chỉnh</span>
            <h2 className="section-title">Tùy Chỉnh Theo Thương Hiệu</h2>
            <div className="section-divider"></div>
          </Reveal>
          <div className="values-grid stagger-children">
            <div className="value-card"><div className="value-icon">🏷️</div><h3>Khắc Logo</h3><p>In/khắc logo doanh nghiệp trên sản phẩm cói, tạo dấu ấn thương hiệu độc đáo.</p></div>
            <div className="value-card"><div className="value-icon">🎨</div><h3>Thiết Kế Riêng</h3><p>Tùy chỉnh màu sắc, hoa văn, kích thước theo yêu cầu của doanh nghiệp.</p></div>
            <div className="value-card"><div className="value-icon">📦</div><h3>Đóng Gói Cao Cấp</h3><p>Hộp quà sinh thái, thẻ cảm ơn handmade, ribbon thương hiệu.</p></div>
            <div className="value-card"><div className="value-icon">🚚</div><h3>Giao Hàng Toàn Quốc</h3><p>Vận chuyển tận nơi, đóng gói cẩn thận, hỗ trợ đơn sỉ từ 50 bộ.</p></div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <Reveal className="cta-content">
          <span className="section-label" style={{ color: 'var(--accent-gold)' }}>Báo giá</span>
          <h2 className="cta-title">Nhận Báo Giá Ngay</h2>
          <p className="cta-text">Liên hệ với chúng tôi để nhận báo giá chi tiết cho đơn hàng doanh nghiệp.</p>
          <SocialLinks />
        </Reveal>
      </section>
    </>
  )
}
