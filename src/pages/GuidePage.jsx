import HeroSection from '../components/ui/HeroSection'
import SocialLinks from '../components/ui/SocialLinks'
import { useScrollReveal } from '../hooks/useAnimations'

function Reveal({ className, children }) {
  const ref = useScrollReveal()
  return <div ref={ref} className={`reveal ${className || ''}`}>{children}</div>
}

export default function GuidePage() {
  return (
    <>
      <HeroSection
        badge="Cẩm nang & Mẹo hay"
        title='Cẩm Nang <em>Chiếu Nẫu</em>'
        subtitle="Hướng dẫn bảo quản sản phẩm cói và chia sẻ lối sống xanh bền vững."
        image="/assets/images/hero_care_guide.jpg"
        inner
      />

      <section className="section section-cream">
        <div className="section-inner">
          <Reveal className="section-header">
            <span className="section-label">Hướng dẫn bảo quản</span>
            <h2 className="section-title">Chăm Sóc Sản Phẩm Cói</h2>
            <div className="section-divider"></div>
          </Reveal>
          <div className="values-grid stagger-children">
            <div className="value-card">
              <div className="value-icon">☀️</div>
              <h3>Phơi Nắng Đúng Cách</h3>
              <p><strong style={{ color: 'var(--primary)' }}>✅ Nên:</strong> Phơi nơi thoáng gió, nắng nhẹ 1-2 giờ/tuần<br/>
              <strong style={{ color: '#c0392b' }}>❌ Không:</strong> Phơi dưới nắng gắt liên tục, gây giòn sợi cói</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🧹</div>
              <h3>Vệ Sinh Sản Phẩm</h3>
              <p><strong style={{ color: 'var(--primary)' }}>✅ Nên:</strong> Lau bằng khăn ẩm, dùng nước muối loãng khử khuẩn<br/>
              <strong style={{ color: '#c0392b' }}>❌ Không:</strong> Ngâm nước lâu, dùng chất tẩy mạnh</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🏠</div>
              <h3>Cất Giữ Đúng Cách</h3>
              <p><strong style={{ color: 'var(--primary)' }}>✅ Nên:</strong> Treo hoặc để nơi khô ráo, thoáng mát<br/>
              <strong style={{ color: '#c0392b' }}>❌ Không:</strong> Để nơi ẩm ướt, gấp nếp lâu ngày</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <Reveal className="section-header">
            <span className="section-label">Mẹo nhanh</span>
            <h2 className="section-title">Tips Hữu Ích</h2>
            <div className="section-divider"></div>
          </Reveal>
          <div className="values-grid stagger-children">
            <div className="value-card"><div className="value-icon">💧</div><h3>Chống Ẩm Mốc</h3><p>Đặt túi hút ẩm silica gel bên trong sản phẩm khi không sử dụng, đặc biệt trong mùa mưa.</p></div>
            <div className="value-card"><div className="value-icon">🍋</div><h3>Khử Mùi Tự Nhiên</h3><p>Dùng vỏ chanh hoặc tinh dầu sả để khử mùi tự nhiên cho sản phẩm cói.</p></div>
            <div className="value-card"><div className="value-icon">🧵</div><h3>Sửa Chữa Đơn Giản</h3><p>Nếu sợi cói bị lỏng, dùng keo thủ công hoặc khâu lại bằng chỉ cùng màu.</p></div>
            <div className="value-card"><div className="value-icon">♻️</div><h3>Tái Sử Dụng</h3><p>Sản phẩm cói cũ có thể tái chế làm chậu cây, giỏ đựng đồ hoặc trang trí.</p></div>
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="section-inner">
          <Reveal className="section-header">
            <span className="section-label">Green Living Journal</span>
            <h2 className="section-title">Sống Xanh Cùng Chiếu Nẫu</h2>
            <div className="section-divider"></div>
          </Reveal>
          <div className="values-grid stagger-children">
            <div className="value-card"><div className="value-icon">🌿</div><h3>Thời Trang Bền Vững</h3><p>Xu hướng thời trang eco-fashion đang lan tỏa mạnh mẽ. Sản phẩm cói tự nhiên là lựa chọn hoàn hảo cho lối sống xanh.</p></div>
            <div className="value-card"><div className="value-icon">🏡</div><h3>Trang Trí Nhà Cửa</h3><p>Sản phẩm cói mang đến vẻ đẹp mộc mạc, gần gũi thiên nhiên cho không gian sống hiện đại.</p></div>
            <div className="value-card"><div className="value-icon">🎁</div><h3>Quà Tặng Ý Nghĩa</h3><p>Tặng sản phẩm cói là tặng giá trị bền vững — vừa đẹp, vừa hữu ích, vừa mang thông điệp xanh.</p></div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <Reveal className="cta-content">
          <span className="section-label" style={{ color: 'var(--accent-gold)' }}>Liên hệ</span>
          <h2 className="cta-title">Kết Nối Với Chiếu Nẫu</h2>
          <p className="cta-text">Bạn cần tư vấn thêm về bảo quản sản phẩm? Liên hệ với chúng tôi!</p>
          <SocialLinks />
        </Reveal>
      </section>
    </>
  )
}
