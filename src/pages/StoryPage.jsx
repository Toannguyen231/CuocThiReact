import { Link } from 'react-router-dom'
import HeroSection from '../components/ui/HeroSection'
import { useCounter, useScrollReveal } from '../hooks/useAnimations'

function Reveal({ className, children }) {
  const ref = useScrollReveal()
  return <div ref={ref} className={`reveal ${className || ''}`}>{children}</div>
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

export default function StoryPage() {
  return (
    <>
      <HeroSection
        badge="Câu chuyện"
        title='Câu Chuyện Của <em>Chiếu Nẫu</em>'
        subtitle="Hành trình gìn giữ nghề truyền thống và kiến tạo giá trị mới từ cây cói quê hương."
        image="/assets/images/story_hero.jpg"
        inner
      />

      <section className="section">
        <div className="section-inner">
          <div className="narrative-section">
            <div className="narrative-image reveal-left">
              <img src="/assets/images/story_hero.jpg" alt="Đồng cói Phú Tân" />
            </div>
            <div className="narrative-text reveal-right">
              <h3>Làng nghề Phú Tân — Nơi bắt đầu câu chuyện</h3>
              <p>Làng nghề dệt chiếu cói Phú Tân là một trong những làng nghề thủ công truyền thống lâu đời, gắn liền với đời sống văn hóa và sinh kế của người dân địa phương qua nhiều thế hệ.</p>
              <p>Từ những cánh đồng cói ven sông, ven đầm, người nghệ nhân Phú Tân tỉ mỉ chọn lọc, phơi, nhuộm và dệt nên những chiếc chiếu bền chắc, mềm mại, thấm đẫm hơi thở của đất và người xứ Nẫu.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-sage">
        <div className="section-inner">
          <div className="narrative-section reverse">
            <div className="narrative-image reveal-right">
              <img src="/assets/images/artisan_weaving.jpg" alt="Nghệ nhân dệt chiếu" />
            </div>
            <div className="narrative-text reveal-left">
              <h3>Thách thức & Chuyển mình</h3>
              <p>Sau nhiều năm, khi thị trường tiêu dùng dần chuyển từ vật liệu truyền thống sang các vật liệu công nghiệp như nhựa, silicone, hay nội thất hiện đại, nghề dệt chiếu truyền thống đứng trước nguy cơ mai một.</p>
              <p>Nhu cầu sử dụng chiếu cói theo công năng cũ ngày càng thu hẹp, mẫu mã chưa được cải tiến, giá trị sản phẩm chưa được nâng tầm. Nhiều hộ gia đình phải bỏ nghề, lao động trẻ rời quê tìm việc ở các thành phố lớn.</p>
              <p>Đứng trước thực trạng đó, nhóm Chiếu Nẫu được hình thành với mong muốn hồi sinh và nâng tầm nghề đan cói — không chỉ là giữ nghề, mà là tạo ra hệ sinh thái sản phẩm mới, phù hợp với thị hiếu hiện đại.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <Reveal className="section-header">
            <span className="section-label">Giải pháp sáng tạo</span>
            <h2 className="section-title">Từ Chiếu Truyền Thống Đến Sản Phẩm Hiện Đại</h2>
            <div className="section-divider"></div>
            <p className="section-description">Chúng tôi giữ nguyên kỹ thuật đan thủ công truyền thống, nhưng mang đến hình thức và công năng mới — từ lót nồi, túi xách đến quạt trang trí.</p>
          </Reveal>

          <div className="narrative-section">
            <div className="narrative-text reveal-left">
              <h3>Hành trình chuyển đổi</h3>
              <p>Thay vì chỉ sản xuất chiếu truyền thống, nhóm Chiếu Nẫu đã nghiên cứu và phát triển nhiều dòng sản phẩm mới từ cói: lót nồi, túi xách, quạt trang trí, túi đeo chéo... Mỗi sản phẩm đều giữ nguyên tinh hoa kỹ thuật đan thủ công, nhưng được thiết kế với mẫu mã hiện đại, phù hợp thị hiếu thời đại.</p>
              <p>Việc đa dạng hóa sản phẩm không chỉ mở rộng thị trường mà còn tạo thêm việc làm, tăng thu nhập cho bà con trong vùng. Nghề đan cói từ chỗ có nguy cơ mai một nay đã trở thành sinh kế vững bền.</p>
            </div>
            <div className="narrative-image reveal-right">
              <img src="/assets/images/hero_banner.jpg" alt="Sản phẩm cói đa dạng" />
            </div>
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="section-inner">
          <Reveal className="section-header">
            <span className="section-label">Giá trị cốt lõi</span>
            <h2 className="section-title">Điều Chúng Tôi Tin Tưởng</h2>
            <div className="section-divider"></div>
          </Reveal>

          <div className="values-grid stagger-children visible">
            <div className="value-card">
              <div className="value-icon">🌿</div>
              <h3>Tự nhiên & Bền vững</h3>
              <p>100% nguyên liệu từ cói tự nhiên, quy trình sản xuất thân thiện môi trường. Mỗi sản phẩm có thể phân hủy sinh học hoàn toàn.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤲</div>
              <h3>Thủ công tinh xảo</h3>
              <p>Từng sản phẩm được đan hoàn toàn bằng tay bởi các nghệ nhân lành nghề, mang theo tâm huyết và kỹ thuật truyền đời.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">👨‍👩‍👧‍👦</div>
              <h3>Cộng đồng</h3>
              <p>Tạo việc làm ổn định cho hơn 50 nghệ nhân và phụ nữ tại địa phương, xây dựng mô hình kinh doanh cộng đồng bền vững.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">✨</div>
              <h3>Sáng tạo & Hiện đại</h3>
              <p>Kết hợp kỹ thuật truyền thống với thiết kế đương đại, tạo ra sản phẩm vừa mang tính di sản vừa phù hợp xu hướng.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="section-inner">
          <div className="stats-grid visible">
            <StatItem target={50} suffix="+" label="Nghệ nhân" />
            <StatItem target={1000} suffix="+" label="Sản phẩm / tháng" />
            <StatItem target={100} suffix="" label="% Nguyên liệu tự nhiên" />
            <StatItem target={3} suffix=" thế hệ" label="Truyền thống kế thừa" />
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content visible">
          <span className="section-label" style={{ color: 'var(--accent-gold)' }}>Khám phá</span>
          <h2 className="cta-title">Sản Phẩm Của Chúng Tôi</h2>
          <p className="cta-text">Mỗi sản phẩm là một tác phẩm thủ công mang đậm hồn quê Việt. Hãy khám phá bộ sưu tập của chúng tôi.</p>
          <Link to="/san-pham" className="hero-cta" style={{ opacity: 1, transform: 'none' }}>
            Xem sản phẩm
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </section>
    </>
  )
}
