import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import HeroSection from '../components/ui/HeroSection'
import ProductCard from '../components/ui/ProductCard'
import SocialLinks from '../components/ui/SocialLinks'
import { products, categories } from '../data/products'
import { useScrollReveal } from '../hooks/useAnimations'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'all'
  const ref = useScrollReveal()

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory)

  const setCategory = (cat) => {
    if (cat === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: cat })
    }
  }

  return (
    <>
      <HeroSection
        badge="Bộ sưu tập"
        title='Sản Phẩm <em>Thủ Công</em>'
        subtitle="Mỗi sản phẩm là một tác phẩm nghệ thuật — đan hoàn toàn bằng tay từ cói tự nhiên, mang đậm hồn quê Việt."
        image="/assets/images/products_hero.jpg"
        inner
      />

      {/* Filter Bar */}
      <div className="product-filter-bar">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`filter-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <section className="section section-cream">
        <div className="section-inner">
          <div ref={ref} className="products-grid stagger-children reveal">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>Không có sản phẩm nào trong danh mục này.</p>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header reveal">
            <span className="section-label">Cam kết chất lượng</span>
            <h2 className="section-title">Vì Sao Chọn Chiếu Nẫu?</h2>
            <div className="section-divider"></div>
          </div>
          <div className="values-grid stagger-children">
            <div className="value-card"><div className="value-icon">🌱</div><h3>100% Tự Nhiên</h3><p>Nguyên liệu cói sạch, không hóa chất, thuốc nhuộm tự nhiên an toàn cho sức khỏe và thân thiện với môi trường.</p></div>
            <div className="value-card"><div className="value-icon">✋</div><h3>Thủ Công 100%</h3><p>Mỗi sản phẩm được đan hoàn toàn bằng tay bởi nghệ nhân lành nghề, không sản phẩm nào giống sản phẩm nào.</p></div>
            <div className="value-card"><div className="value-icon">💎</div><h3>Thiết Kế Độc Đáo</h3><p>Kết hợp hài hòa giữa kỹ thuật truyền thống và xu hướng thiết kế hiện đại.</p></div>
            <div className="value-card"><div className="value-icon">❤️</div><h3>Ý Nghĩa Xã Hội</h3><p>Mua sản phẩm là góp phần bảo tồn nghề truyền thống và hỗ trợ sinh kế cho cộng đồng nghệ nhân.</p></div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content reveal">
          <span className="section-label" style={{ color: 'var(--accent-gold)' }}>Đặt hàng</span>
          <h2 className="cta-title">Sẵn Sàng Đặt Hàng?</h2>
          <p className="cta-text">Liên hệ với chúng tôi để đặt hàng hoặc tùy chỉnh sản phẩm theo yêu cầu.</p>
          <SocialLinks />
        </div>
      </section>
    </>
  )
}
