import { useEffect, useState, useMemo, useRef } from 'react'
import { api, formatPrice } from '../../utils/api'

const CATEGORY_OPTIONS = [
  { id: 'all', name: 'Tất cả danh mục' },
  { id: 'tui-xach', name: 'Túi xách cói' },
  { id: 'lot-noi', name: 'Lót nồi cói' },
  { id: 'quat-coi', name: 'Quạt cói' },
  { id: 'tui-deo-cheo', name: 'Túi đeo chéo' },
  { id: 'qua-tang-doanh-nghiep', name: 'Quà doanh nghiệp' }
]

function generateSlug(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const DEFAULT_FORM_DATA = {
  name: '',
  slug: '',
  shortDesc: '',
  description: '',
  price: 0,
  priceMax: 0,
  priceDisplay: '',
  category: 'tui-xach',
  categoryName: 'Túi xách cói',
  image: '',
  imageHover: '',
  stock: 0,
  featured: false,
  active: true,
  type: 'product',
  specs: []
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // View state
  const [isCreating, setIsCreating] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  // Form State
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA)
  const [originalFormData, setOriginalFormData] = useState(null)
  const [specs, setSpecs] = useState([])

  // Action states
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState(null) // 'image' | 'imageHover'
  const [toastMessage, setToastMessage] = useState(null)

  // Refs for file input
  const mainImageInputRef = useRef(null)
  const hoverImageInputRef = useRef(null)

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type })
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await api.getAdminProducts()
      setProducts(data.products || [])
    } catch (err) {
      showToast(err.message || 'Lỗi tải danh sách sản phẩm', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Filtered and sorted products (Newest ID first)
  const filteredProducts = useMemo(() => {
    return [...products]
      .filter((p) => {
        const matchCat = selectedCategory === 'all' || p.category === selectedCategory
        const matchSearch = !searchTerm.trim() ||
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchCat && matchSearch
      })
      .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
  }, [products, selectedCategory, searchTerm])

  // Open Create Mode
  const handleStartCreate = () => {
    const initData = {
      ...DEFAULT_FORM_DATA,
      specs: []
    }
    setFormData(initData)
    setOriginalFormData(JSON.stringify(initData))
    setSpecs([])
    setEditingProduct(null)
    setIsCreating(true)
  }

  // Open Edit Mode
  const handleStartEdit = (product) => {
    const productSpecs = Array.isArray(product.specs)
      ? product.specs.map(s => ({ label: s.label || '', value: s.value || '' }))
      : []

    const initData = {
      name: product.name || '',
      slug: product.slug || '',
      shortDesc: product.shortDesc || '',
      description: product.description || '',
      price: product.price ?? 0,
      priceMax: product.priceMax ?? 0,
      priceDisplay: product.priceDisplay || '',
      category: product.category || 'tui-xach',
      categoryName: product.categoryName || 'Túi xách cói',
      image: product.image || '',
      imageHover: product.imageHover || '',
      stock: product.stock ?? 0,
      featured: Boolean(product.featured),
      active: product.active !== false,
      type: product.type || 'product',
      specs: productSpecs
    }

    setFormData(initData)
    setOriginalFormData(JSON.stringify(initData))
    setSpecs(productSpecs)
    setEditingProduct(product)
    setIsCreating(false)
  }

  // Cancel edit / create with dirty check
  const handleCancel = () => {
    const currentSerialized = JSON.stringify({ ...formData, specs })
    if (originalFormData && currentSerialized !== originalFormData) {
      const confirmLeave = window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn hủy bỏ?')
      if (!confirmLeave) return
    }
    setIsCreating(false)
    setEditingProduct(null)
  }

  // Handle Form Change
  const handleFieldChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }

      // Auto generate slug if creating and user modifies name
      if (field === 'name' && isCreating) {
        next.slug = generateSlug(value)
      }

      // Auto update categoryName when category changes
      if (field === 'category') {
        const found = CATEGORY_OPTIONS.find((c) => c.id === value)
        if (found && found.id !== 'all') {
          next.categoryName = found.name
        }
      }

      return next
    })
  }

  // Specs handlers
  const handleAddSpec = () => {
    setSpecs((prev) => [...prev, { label: '', value: '' }])
  }

  const handleUpdateSpec = (index, key, value) => {
    setSpecs((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [key]: value }
      return updated
    })
  }

  const handleRemoveSpec = (index) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index))
  }

  // Upload image handler
  const handleFileChange = async (event, field) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadingField(field)
      const res = await api.uploadImage(file)
      handleFieldChange(field, res.url)
      showToast('Tải ảnh lên thành công!')
    } catch (err) {
      showToast(err.message || 'Lỗi khi upload ảnh', 'error')
    } finally {
      setUploadingField(null)
      event.target.value = ''
    }
  }

  // Save product
  const handleSaveProduct = async (e) => {
    if (e) e.preventDefault()

    if (!formData.name.trim()) {
      showToast('Vui lòng nhập tên sản phẩm', 'error')
      return
    }

    const payload = {
      ...formData,
      price: Math.max(0, Number(formData.price) || 0),
      priceMax: Math.max(0, Number(formData.priceMax) || 0),
      stock: Math.max(0, Number(formData.stock) || 0),
      specs: specs.filter((s) => s.label.trim() || s.value.trim())
    }

    try {
      setSaving(true)
      if (isCreating) {
        await api.createProduct(payload)
        showToast('Tạo sản phẩm mới thành công!')
      } else if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload)
        showToast('Cập nhật sản phẩm thành công!')
      }
      await fetchProducts()
      setIsCreating(false)
      setEditingProduct(null)
    } catch (err) {
      showToast(err.message || 'Không thể lưu sản phẩm', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Delete product
  const handleDeleteProduct = async (product) => {
    const confirmDelete = window.confirm(`Xóa sản phẩm "${product.name}"? Hành động không thể hoàn tác.`)
    if (!confirmDelete) return

    try {
      await api.deleteProduct(product.id)
      showToast(`Đã xóa sản phẩm "${product.name}"!`)
      if (editingProduct?.id === product.id) {
        setIsCreating(false)
        setEditingProduct(null)
      }
      await fetchProducts()
    } catch (err) {
      showToast(err.message || 'Lỗi khi xóa sản phẩm', 'error')
    }
  }

  const isFormView = isCreating || editingProduct !== null

  return (
    <div className="admin-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`admin-floating-toast ${toastMessage.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <span>{toastMessage.text}</span>
          <button type="button" onClick={() => setToastMessage(null)}>✕</button>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={mainImageInputRef}
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange(e, 'image')}
      />
      <input
        type="file"
        ref={hoverImageInputRef}
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange(e, 'imageHover')}
      />

      {/* Header */}
      <div className="admin-page-header admin-product-header">
        <div>
          <h1>Quản Lý Sản Phẩm</h1>
          <p>{products.length} sản phẩm và bộ quà tặng thủ công</p>
        </div>
        {!isFormView && (
          <button className="admin-btn-primary" onClick={handleStartCreate}>
            + Thêm sản phẩm mới
          </button>
        )}
      </div>

      {/* VIEW 1: PRODUCT LIST VIEW */}
      {!isFormView && (
        <>
          {/* Filter & Search Bar */}
          <div className="admin-product-toolbar">
            <div className="admin-category-filter">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.id}
                  className={`admin-filter-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="admin-search-wrapper">
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên, danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="admin-clear-search" onClick={() => setSearchTerm('')}>✕</button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="admin-loading">Đang tải danh sách sản phẩm...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="admin-empty-state">
              <p>Không tìm thấy sản phẩm phù hợp.</p>
              {searchTerm || selectedCategory !== 'all' ? (
                <button
                  className="admin-btn-secondary"
                  onClick={() => {
                    setSelectedCategory('all')
                    setSearchTerm('')
                  }}
                >
                  Xóa bộ lọc
                </button>
              ) : null}
            </div>
          ) : (
            <div className="admin-products-table-wrapper">
              <table className="admin-table admin-products-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá bán</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th>Nổi bật</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-prod-thumb-row">
                          <img
                            src={product.image || '/assets/images/product_tui_xach.jpg'}
                            alt={product.name}
                            className="admin-prod-thumb"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = '/assets/images/product_tui_xach.jpg'
                            }}
                          />
                          <div>
                            <strong className="admin-prod-name">{product.name}</strong>
                            <div className="admin-prod-slug">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-category-badge">
                          {product.categoryName || product.category}
                        </span>
                      </td>
                      <td>
                        <strong className="admin-price-cell">
                          {product.priceDisplay || formatPrice(product.price)}
                        </strong>
                      </td>
                      <td>
                        <span className={`admin-stock-badge ${product.stock <= 5 ? 'stock-low' : ''}`}>
                          {product.stock ?? 0} chiếc
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${product.active === false ? 'status-cancelled' : 'status-delivered'}`}>
                          {product.active === false ? 'Ẩn' : 'Đang bán'}
                        </span>
                      </td>
                      <td>
                        {product.featured ? (
                          <span className="featured-star" title="Sản phẩm nổi bật">★ Có</span>
                        ) : (
                          <span className="featured-none">—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="user-action-buttons">
                          <button
                            type="button"
                            className="user-btn-action"
                            title="Chỉnh sửa sản phẩm"
                            onClick={() => handleStartEdit(product)}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            className="user-btn-action user-btn-action--delete"
                            title="Xóa sản phẩm"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* VIEW 2: PRODUCT EDIT/CREATE FORM */}
      {isFormView && (
        <form className="admin-product-form-container" onSubmit={handleSaveProduct}>
          <div className="admin-form-header-bar">
            <div>
              <h2>{isCreating ? 'Thêm Sản Phẩm Mới' : `Chỉnh Sửa: ${editingProduct?.name}`}</h2>
              <span className="admin-form-subtitle">
                {isCreating ? 'Điền thông tin và hình ảnh để đưa sản phẩm lên gian hàng' : `Mã sản phẩm: #${editingProduct?.id}`}
              </span>
            </div>
            <div className="admin-form-actions-top">
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Hủy bỏ
              </button>
              <button type="submit" className="admin-btn-primary" disabled={saving}>
                {saving ? 'Đang lưu...' : isCreating ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>

          <div className="admin-form-two-cols">
            {/* Cột trái (60%): Thông tin chi tiết */}
            <div className="admin-form-col-left">
              <div className="admin-card-section">
                <h3 className="admin-card-section-title">Thông tin cơ bản</h3>

                <label className="admin-field">
                  <span>Tên sản phẩm *</span>
                  <input
                    type="text"
                    required
                    placeholder="Túi xách cói bán nguyệt..."
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                  />
                </label>

                <label className="admin-field">
                  <span>Đường dẫn định danh (Slug)</span>
                  <input
                    type="text"
                    placeholder="tui-xach-coi-ban-nguyet"
                    value={formData.slug}
                    disabled={!isCreating}
                    onChange={(e) => handleFieldChange('slug', e.target.value)}
                  />
                  <small className="admin-field-hint">
                    {isCreating ? 'Tự động tạo từ tên sản phẩm (có thể chỉnh sửa)' : 'Không thể thay đổi slug khi chỉnh sửa để tránh gãy liên kết'}
                  </small>
                </label>

                <div className="admin-form-row">
                  <label className="admin-field">
                    <span>Danh mục</span>
                    <select
                      value={formData.category}
                      onChange={(e) => handleFieldChange('category', e.target.value)}
                    >
                      {CATEGORY_OPTIONS.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </label>

                  <label className="admin-field">
                    <span>Tên hiển thị danh mục</span>
                    <input
                      type="text"
                      placeholder="Túi xách cói"
                      value={formData.categoryName}
                      onChange={(e) => handleFieldChange('categoryName', e.target.value)}
                    />
                  </label>
                </div>

                <div className="admin-form-row">
                  <label className="admin-field">
                    <span>Loại sản phẩm</span>
                    <select
                      value={formData.type}
                      onChange={(e) => handleFieldChange('type', e.target.value)}
                    >
                      <option value="product">Sản phẩm đơn lẻ</option>
                      <option value="gift-set">Bộ quà tặng (Gift Set)</option>
                    </select>
                  </label>
                  <label className="admin-field">
                    <span>Số lượng tồn kho</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => handleFieldChange('stock', e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="admin-card-section">
                <h3 className="admin-card-section-title">Giá và phân khúc</h3>

                <div className="admin-form-row">
                  <label className="admin-field">
                    <span>Giá từ (VNĐ) *</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.price}
                      onChange={(e) => handleFieldChange('price', e.target.value)}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Giá đến (VNĐ - tùy chọn)</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="350000"
                      value={formData.priceMax}
                      onChange={(e) => handleFieldChange('priceMax', e.target.value)}
                    />
                  </label>
                </div>

                <label className="admin-field">
                  <span>Chuỗi hiển thị giá</span>
                  <input
                    type="text"
                    placeholder="180.000 – 350.000₫"
                    value={formData.priceDisplay}
                    onChange={(e) => handleFieldChange('priceDisplay', e.target.value)}
                  />
                  <small className="admin-field-hint">Nếu để trống, hệ thống sẽ tự sinh từ giá từ và giá đến.</small>
                </label>
              </div>

              <div className="admin-card-section">
                <h3 className="admin-card-section-title">Mô tả sản phẩm</h3>

                <label className="admin-field">
                  <span>Mô tả ngắn (1-2 dòng)</span>
                  <textarea
                    rows={2}
                    placeholder="Tóm tắt 1-2 dòng điểm nhấn của sản phẩm..."
                    value={formData.shortDesc}
                    onChange={(e) => handleFieldChange('shortDesc', e.target.value)}
                  />
                </label>

                <label className="admin-field">
                  <span>Mô tả chi tiết</span>
                  <textarea
                    rows={5}
                    placeholder="Mô tả kỹ lưỡng chất liệu, văn hóa đan cói, tính năng ứng dụng..."
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                  />
                </label>
              </div>
            </div>

            {/* Cột phải (40%): Hình ảnh và trạng thái */}
            <div className="admin-form-col-right">
              {/* Ảnh chính */}
              <div className="admin-card-section">
                <h3 className="admin-card-section-title">Ảnh đại diện chính</h3>
                <div className="admin-image-upload-box">
                  {formData.image ? (
                    <div className="admin-image-preview-wrapper">
                      <img src={formData.image} alt="Ảnh chính" className="admin-image-preview" />
                      <button
                        type="button"
                        className="admin-image-remove-btn"
                        title="Xóa ảnh"
                        onClick={() => handleFieldChange('image', '')}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="admin-image-placeholder">
                      <span>Chưa có ảnh chính</span>
                    </div>
                  )}

                  <div className="admin-image-actions">
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      disabled={uploadingField === 'image'}
                      onClick={() => mainImageInputRef.current?.click()}
                    >
                      {uploadingField === 'image' ? 'Đang tải lên...' : 'Chọn ảnh mới'}
                    </button>
                    <input
                      type="text"
                      className="admin-image-url-input"
                      placeholder="Hoặc nhập đường dẫn ảnh..."
                      value={formData.image}
                      onChange={(e) => handleFieldChange('image', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Ảnh hover */}
              <div className="admin-card-section">
                <h3 className="admin-card-section-title">Ảnh hover khi rê chuột</h3>
                <div className="admin-image-upload-box">
                  {formData.imageHover ? (
                    <div className="admin-image-preview-wrapper">
                      <img src={formData.imageHover} alt="Ảnh hover" className="admin-image-preview" />
                      <button
                        type="button"
                        className="admin-image-remove-btn"
                        title="Xóa ảnh hover"
                        onClick={() => handleFieldChange('imageHover', '')}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="admin-image-placeholder">
                      <span>Chưa có ảnh hover</span>
                    </div>
                  )}

                  <div className="admin-image-actions">
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      disabled={uploadingField === 'imageHover'}
                      onClick={() => hoverImageInputRef.current?.click()}
                    >
                      {uploadingField === 'imageHover' ? 'Đang tải lên...' : 'Chọn ảnh hover'}
                    </button>
                    <input
                      type="text"
                      className="admin-image-url-input"
                      placeholder="Hoặc nhập URL ảnh hover..."
                      value={formData.imageHover}
                      onChange={(e) => handleFieldChange('imageHover', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Trạng thái & Tùy chọn */}
              <div className="admin-card-section">
                <h3 className="admin-card-section-title">Cài đặt hiển thị</h3>

                <label className="admin-toggle admin-toggle-box">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleFieldChange('active', e.target.checked)}
                  />
                  <div>
                    <strong>Hiển thị trên website</strong>
                    <div className="admin-toggle-desc">Tắt = ẩn sản phẩm khỏi khách hàng</div>
                  </div>
                </label>

                <label className="admin-toggle admin-toggle-box">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleFieldChange('featured', e.target.checked)}
                  />
                  <div>
                    <strong>Sản phẩm nổi bật</strong>
                    <div className="admin-toggle-desc">Hiển thị ở section nổi bật trên trang chủ</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Dưới Form: Thông số kỹ thuật (Full width) */}
          <div className="admin-card-section admin-specs-section">
            <div className="admin-specs-header">
              <div>
                <h3 className="admin-card-section-title" style={{ margin: 0 }}>Thông số kỹ thuật sản phẩm</h3>
                <span className="admin-field-hint">Khai báo kích thước, chất liệu, màu sắc để khách hàng xem chi tiết</span>
              </div>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={handleAddSpec}
              >
                + Thêm thông số
              </button>
            </div>

            {specs.length === 0 ? (
              <div className="admin-specs-empty">
                Chưa có thông số kỹ thuật nào. Bấm "+ Thêm thông số" để khai báo.
              </div>
            ) : (
              <div className="admin-specs-list">
                {specs.map((spec, index) => (
                  <div key={index} className="admin-spec-row">
                    <input
                      type="text"
                      placeholder="Tên thông số (VD: Kiểu dáng, Chất liệu)"
                      value={spec.label}
                      onChange={(e) => handleUpdateSpec(index, 'label', e.target.value)}
                      className="admin-spec-label-input"
                    />
                    <input
                      type="text"
                      placeholder="Giá trị (VD: Túi xách tay bán nguyệt, Cói tự nhiên)"
                      value={spec.value}
                      onChange={(e) => handleUpdateSpec(index, 'value', e.target.value)}
                      className="admin-spec-value-input"
                    />
                    <button
                      type="button"
                      className="admin-spec-delete-btn"
                      title="Xóa thông số này"
                      onClick={() => handleRemoveSpec(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sticky action bar */}
          <div className="admin-form-sticky-bottom">
            <div className="admin-sticky-inner">
              {editingProduct && (
                <button
                  type="button"
                  className="btn-danger-action"
                  onClick={() => handleDeleteProduct(editingProduct)}
                >
                  Xóa sản phẩm này
                </button>
              )}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : isCreating ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
