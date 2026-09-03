import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug
    })
  }

  return (
    <div className="product-card">
      <Link to={`/san-pham/${product.slug}`} className="product-card-image">
        <img src={product.image} alt={product.name} loading="lazy" />
        <div className="product-card-overlay"></div>
      </Link>
      <div className="product-card-body">
        <h3 className="product-card-name">
          <Link to={`/san-pham/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="product-card-desc">{product.shortDesc}</p>
        <div className="product-card-footer">
          <span className="product-card-price">{product.priceDisplay}</span>
          <div className="product-card-actions">
            <button className="btn-add-cart" onClick={handleAddToCart} title="Thêm vào giỏ">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            </button>
            <Link to={`/san-pham/${product.slug}`} className="btn-view">Xem thêm →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
