import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { products } from '../data/products'

/**
 * Trang xác thực / kiểm tra nguồn gốc sản phẩm Chiếu Nẫu
 * Route: /quet-ma hoặc /quet-ma.html
 * Hỗ trợ prefill qua query param ?code=xxx (id hoặc slug)
 */
export default function VerifyPage() {
  const [searchParams] = useSearchParams()
  const [inputCode, setInputCode] = useState('')
  const [searchedProduct, setSearchedProduct] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Hàm tra cứu sản phẩm dựa trên ID hoặc slug
  const lookupProduct = (code) => {
    if (!code) return null
    const query = code.trim().toLowerCase()
    return products.find(
      (p) => String(p.id) === query || p.slug.toLowerCase() === query
    )
  }

  // Tự động kiểm tra nếu có query params ?code=...
  useEffect(() => {
    const codeParam = searchParams.get('code')
    if (codeParam) {
      setInputCode(codeParam)
      const found = lookupProduct(codeParam)
      setSearchedProduct(found || null)
      setHasSearched(true)
    }
  }, [searchParams])

  const handleVerify = (e) => {
    e.preventDefault()
    if (!inputCode.trim()) return
    const found = lookupProduct(inputCode)
    setSearchedProduct(found || null)
    setHasSearched(true)
  }

  return (
    <div className="section section-cream" style={{ minHeight: '80vh', paddingTop: 'calc(var(--navbar-height, 80px) + 2rem)' }}>
      <div className="section-inner" style={{ maxWidth: '680px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Tiêu đề trang */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="section-label">Minh Bạch & Nguồn Gốc</span>
          <h1 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
            Xác Thực Sản Phẩm
          </h1>
          <div className="section-divider" style={{ margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: '520px', margin: '0 auto' }}>
            Nhập mã định danh hoặc quét mã QR in trên thẻ bài sản phẩm để kiểm tra nguồn gốc thủ công chính hãng từ làng nghề Chiếu Nẫu.
          </p>
        </div>

        {/* Khung demo camera quét QR (Placeholder cho Phase 2) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '2px dashed var(--accent, #b5b89a)',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '2rem',
            position: 'relative'
          }}
        >
          {/* TODO(Phase 2): Tích hợp thư viện quét mã QR qua Camera (vd: html5-qrcode hoặc jsQR) khi có HTTPS và cấp quyền camera */}
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 12px auto',
              borderRadius: '50%',
              backgroundColor: 'rgba(45, 90, 45, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary, #2d5a2d)'
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
              <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
              <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
              <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
              <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
              <rect x="7" y="7" width="10" height="10" rx="1"></rect>
            </svg>
          </div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: 'var(--primary-dark)' }}>
            Khung Quét QR Code
          </h3>
          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-light)' }}>
            Tính năng quét trực tiếp qua camera sẽ khả dụng trên Phase 2. Hiện tại bạn có thể nhập mã sản phẩm bên dưới để tra cứu ngay!
          </p>
        </div>

        {/* Form nhập mã tay */}
        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Nhập ID (1, 2, 3...) hoặc slug (tui-xach-coi...)"
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid var(--accent, #b5b89a)',
              fontSize: '0.95rem',
              backgroundColor: '#ffffff'
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              backgroundColor: 'var(--primary, #2d5a2d)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Kiểm tra
          </button>
        </form>

        {/* Kết quả xác thực */}
        {hasSearched && (
          <div>
            {searchedProduct ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid rgba(45, 90, 45, 0.2)',
                  padding: '24px',
                  animation: 'fadeInUp 0.3s ease-out'
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(45, 90, 45, 0.1)',
                    color: 'var(--primary, #2d5a2d)',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '16px'
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Hàng thật từ Chiếu Nẫu — Đã xác thực
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <img
                    src={searchedProduct.image}
                    alt={searchedProduct.name}
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      border: '1px solid rgba(0,0,0,0.06)'
                    }}
                  />
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--accent-warm)', fontWeight: 600, textTransform: 'uppercase' }}>
                      {searchedProduct.categoryName}
                    </span>
                    <h3 style={{ margin: '4px 0 8px 0', fontSize: '1.25rem', color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
                      {searchedProduct.name}
                    </h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {searchedProduct.shortDesc}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                        {searchedProduct.priceDisplay}
                      </strong>
                      <Link
                        to={`/san-pham/${searchedProduct.slug}`}
                        style={{
                          fontSize: '0.88rem',
                          color: 'var(--primary)',
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}
                      >
                        Xem chi tiết sản phẩm →
                      </Link>
                    </div>
                  </div>
                </div>

                {searchedProduct.specs && searchedProduct.specs.length > 0 && (
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', color: 'var(--primary-dark)' }}>
                      Thông số thủ công:
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                      {searchedProduct.specs.map((spec, i) => (
                        <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <strong>{spec.label}:</strong> {spec.value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  border: '1px solid rgba(212, 115, 138, 0.3)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ color: 'var(--lotus-pink, #d4738a)', marginBottom: '8px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="40" height="40">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: 'var(--primary-dark)' }}>
                  Không tìm thấy thông tin sản phẩm
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Mã sản phẩm bạn nhập không trùng khớp với dữ liệu thủ công của Chiếu Nẫu. Vui lòng kiểm tra lại mã in trên thẻ bài.
                </p>
                <Link to="/san-pham" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                  Xem danh mục sản phẩm chính hãng →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
