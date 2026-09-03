import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { formatPrice } from '../../utils/api'

export default function CartDrawer() {
  const { cart, cartCount, cartTotal, drawerOpen, closeDrawer, removeFromCart, updateQuantity } = useCart()

  return (
    <>
      <div className={`cart-drawer-overlay ${drawerOpen ? 'active' : ''}`} onClick={closeDrawer}></div>
      <div className={`cart-drawer ${drawerOpen ? 'active' : ''}`}>
        <div className="cart-drawer-header">
          <h3>🛒 Giỏ hàng ({cartCount})</h3>
          <button className="cart-drawer-close" onClick={closeDrawer} aria-label="Đóng">✕</button>
        </div>

        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍️</div>
              <p>Giỏ hàng trống</p>
              <Link to="/san-pham" className="btn-shop" onClick={closeDrawer}>Mua sắm ngay</Link>
            </div>
          ) : (
            <ul className="cart-items-list">
              {cart.map(item => (
                <li key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <span className="cart-item-price">{formatPrice(item.price)}</span>
                    <div className="cart-item-qty">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.id)} aria-label="Xóa">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total">
              <span>Tổng cộng:</span>
              <strong>{formatPrice(cartTotal)}</strong>
            </div>
            <Link to="/gio-hang" className="btn-view-cart" onClick={closeDrawer}>Xem giỏ hàng</Link>
            <Link to="/thanh-toan" className="btn-checkout" onClick={closeDrawer}>Thanh toán →</Link>
          </div>
        )}
      </div>
    </>
  )
}
