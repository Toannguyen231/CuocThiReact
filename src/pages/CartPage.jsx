import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { formatPrice } from '../utils/api'

export default function CartPage() {
  const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart()

  return (
    <div className="cart-page">
      <div className="cart-page-header">
        <h1>🛒 Giỏ Hàng</h1>
        <p>{cart.length} sản phẩm</p>
      </div>

      {cart.length === 0 ? (
        <div className="cart-empty-page">
          <div className="cart-empty-icon">🛍️</div>
          <h2>Giỏ hàng trống</h2>
          <p>Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
          <Link to="/san-pham" className="btn-primary-action">Mua sắm ngay →</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Giá</th>
                  <th>Số lượng</th>
                  <th>Tổng</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id}>
                    <td className="cart-item-cell">
                      <img src={item.image} alt={item.name} />
                      <div>
                        <Link to={`/san-pham/${item.slug}`}><strong>{item.name}</strong></Link>
                      </div>
                    </td>
                    <td>{formatPrice(item.price)}</td>
                    <td>
                      <div className="qty-selector">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </td>
                    <td><strong>{formatPrice(item.price * item.quantity)}</strong></td>
                    <td><button className="btn-remove" onClick={() => removeFromCart(item.id)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="cart-actions">
              <Link to="/san-pham" className="btn-continue">← Tiếp tục mua sắm</Link>
              <button className="btn-clear-cart" onClick={clearCart}>Xóa giỏ hàng</button>
            </div>
          </div>
          <div className="cart-summary">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span style={{ color: 'var(--primary)' }}>Miễn phí</span>
            </div>
            <div className="summary-row summary-total">
              <span>Tổng cộng:</span>
              <strong>{formatPrice(cartTotal)}</strong>
            </div>
            <Link to="/thanh-toan" className="btn-checkout-lg">Tiến hành thanh toán →</Link>
          </div>
        </div>
      )}
    </div>
  )
}
