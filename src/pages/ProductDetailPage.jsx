import { useParams, Link } from 'react-router-dom'
import { products } from '../data/products'
import { useCart } from '../contexts/CartContext'
import { useState } from 'react'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const product = products.find(p => p.slug === slug)
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  if (!product) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
        <h2>Không tìm thấy sản phẩm</h2>
        <Link to="/san-pham" className="btn-primary-action" style={{ marginTop: '2rem' }}>← Quay lại sản phẩm</Link>
      </div>
    )
  }

  const related = products.filter(p => p.id !== product.id).slice(0, 3)

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug
    }, quantity)
  }

  return (
    <>
      <section className="section product-detail-page">
        <div className="section-inner">
          <div className="product-detail">
            <div className="product-detail-image reveal-left">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-detail-info reveal-right">
              <span className="section-label">{product.sectionLabel}</span>
              <h1 className="product-detail-name">{product.name}</h1>
              <p className="product-detail-desc">{product.description}</p>

              <div className="product-specs">
                {product.specs.map((spec, i) => (
                  <div key={i} className="product-spec">
                    <span className="product-spec-label">{spec.label}</span>
                    <span className="product-spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>

              <div className="product-price-tag">{product.priceDisplay}</div>

              <div style={{ margin: '-0.5rem 0 1.25rem 0' }}>
                <Link
                  to={`/quet-ma?code=${product.slug}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    color: 'var(--primary)',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  Kiểm tra hàng thật →
                </Link>
              </div>

              <div className="product-add-to-cart">
                <div className="qty-selector">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
                <button className="btn-add-to-cart-lg" onClick={handleAddToCart}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="section section-cream">
          <div className="section-inner">
            <div className="section-header">
              <span className="section-label">Có thể bạn thích</span>
              <h2 className="section-title">Sản Phẩm Liên Quan</h2>
              <div className="section-divider"></div>
            </div>
            <div className="products-grid">
              {related.map(p => (
                <div key={p.id} className="product-card">
                  <Link to={`/san-pham/${p.slug}`} className="product-card-image">
                    <img src={p.image} alt={p.name} loading="lazy" />
                    <div className="product-card-overlay"></div>
                  </Link>
                  <div className="product-card-body">
                    <h3 className="product-card-name"><Link to={`/san-pham/${p.slug}`}>{p.name}</Link></h3>
                    <p className="product-card-desc">{p.shortDesc}</p>
                    <div className="product-card-footer">
                      <span className="product-card-price">{p.priceDisplay}</span>
                      <Link to={`/san-pham/${p.slug}`} className="btn-view">Xem thêm →</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
