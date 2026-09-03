import { useEffect, useState } from 'react'
import { formatPrice, getApiUrl } from '../../utils/api'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)

  const fetchProducts = () => {
    fetch(getApiUrl('/api/admin/products'), {
      headers: { Authorization: `Bearer ${localStorage.getItem('chieunau_admin_token')}` }
    })
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  const updateLocal = (id, key, value) => {
    setProducts(items => items.map(item => item.id === id ? { ...item, [key]: value } : item))
  }

  const saveProduct = async (product) => {
    setSavingId(product.id)
    await fetch(getApiUrl(`/api/admin/products/${product.id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('chieunau_admin_token')}`
      },
      body: JSON.stringify({
        name: product.name,
        price: Number(product.price),
        priceDisplay: product.priceDisplay,
        stock: Number(product.stock),
        active: product.active
      })
    })
    setSavingId(null)
    fetchProducts()
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Quản Lý Sản Phẩm</h1>
        <p>{products.length} sản phẩm và bộ quà tặng</p>
      </div>

      {loading ? <div className="admin-loading">Đang tải...</div> : (
        <div className="admin-product-grid">
          {products.map(product => (
            <article key={product.id} className="admin-product-card">
              <img src={product.image} alt={product.name} />
              <div className="admin-product-body">
                <div className="admin-section-header">
                  <div>
                    <small>{product.categoryName || product.category}</small>
                    <h3>{product.name}</h3>
                  </div>
                  <span className={`status-badge ${product.active === false ? 'status-cancelled' : 'status-delivered'}`}>
                    {product.active === false ? 'Ẩn' : 'Đang bán'}
                  </span>
                </div>

                <label className="admin-field">
                  <span>Tên sản phẩm</span>
                  <input value={product.name} onChange={(event) => updateLocal(product.id, 'name', event.target.value)} />
                </label>
                <div className="admin-form-row">
                  <label className="admin-field">
                    <span>Giá từ</span>
                    <input type="number" min="0" value={product.price} onChange={(event) => updateLocal(product.id, 'price', event.target.value)} />
                  </label>
                  <label className="admin-field">
                    <span>Tồn kho</span>
                    <input type="number" min="0" value={product.stock || 0} onChange={(event) => updateLocal(product.id, 'stock', event.target.value)} />
                  </label>
                </div>
                <label className="admin-field">
                  <span>Giá hiển thị</span>
                  <input value={product.priceDisplay || formatPrice(product.price)} onChange={(event) => updateLocal(product.id, 'priceDisplay', event.target.value)} />
                </label>
                <label className="admin-toggle">
                  <input type="checkbox" checked={product.active !== false} onChange={(event) => updateLocal(product.id, 'active', event.target.checked)} />
                  <span>Hiển thị trên website</span>
                </label>
                <button className="admin-save-btn" onClick={() => saveProduct(product)} disabled={savingId === product.id}>
                  {savingId === product.id ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
