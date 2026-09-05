import { useState, useEffect } from 'react'
import { formatPrice, getApiUrl } from '../../utils/api'

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form tạo voucher mới
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percent', // 'percent' hoặc 'fixed'
    discountPercent: 10,
    discountAmountFixed: 20000,
    minOrderValue: 0,
    maxDiscount: 100000,
    appOnly: false,
    oncePerCustomer: true,
    usageLimit: 100
  })

  const token = localStorage.getItem('chieunau_admin_token')

  const fetchVouchers = async () => {
    try {
      setLoading(true)
      const res = await fetch(getApiUrl('/api/admin/vouchers'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setVouchers(data.vouchers || [])
      } else {
        setError(data.message || 'Lỗi khi tải danh sách voucher')
      }
    } catch {
      setError('Không thể kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVouchers()
  }, [])

  const handleToggleActive = async (voucher) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/vouchers/${voucher.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ active: !voucher.active })
      })
      if (res.ok) {
        setSuccess(`Đã ${voucher.active ? 'tạm khóa' : 'kích hoạt'} mã ${voucher.code}`)
        setTimeout(() => setSuccess(''), 3000)
        fetchVouchers()
      }
    } catch {
      setError('Lỗi khi cập nhật trạng thái')
    }
  }

  const handleDelete = async (voucher) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn voucher ${voucher.code}?`)) return
    try {
      const res = await fetch(getApiUrl(`/api/admin/vouchers/${voucher.id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setSuccess(`Đã xóa voucher ${voucher.code}`)
        setTimeout(() => setSuccess(''), 3000)
        fetchVouchers()
      }
    } catch {
      setError('Lỗi khi xóa voucher')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        code: form.code,
        description: form.description,
        discountPercent: form.discountType === 'percent' ? Number(form.discountPercent) : 0,
        discountAmountFixed: form.discountType === 'fixed' ? Number(form.discountAmountFixed) : 0,
        minOrderValue: Number(form.minOrderValue) || 0,
        maxDiscount: form.discountType === 'percent' ? Number(form.maxDiscount) : 0,
        appOnly: form.appOnly,
        oncePerCustomer: form.oncePerCustomer,
        usageLimit: Number(form.usageLimit) || 100
      }

      const res = await fetch(getApiUrl('/api/admin/vouchers'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(`Tạo thành công voucher ${data.voucher.code}!`)
        setShowModal(false)
        setForm({
          code: '',
          description: '',
          discountType: 'percent',
          discountPercent: 10,
          discountAmountFixed: 20000,
          minOrderValue: 0,
          maxDiscount: 100000,
          appOnly: false,
          oncePerCustomer: true,
          usageLimit: 100
        })
        setTimeout(() => setSuccess(''), 3000)
        fetchVouchers()
      } else {
        setError(data.message || 'Lỗi khi tạo voucher')
      }
    } catch {
      setError('Lỗi kết nối máy chủ')
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>🎟️ Quản Lý Mã Giảm Giá (Vouchers)</h1>
          <p>Hệ thống voucher động, hỗ trợ phân quyền độc quyền App & giới hạn 1 lần/khách</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="btn-primary-action"
          style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }}
        >
          + Thêm Voucher Mới
        </button>
      </div>

      {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ background: '#d4edda', color: '#155724', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}

      {loading ? (
        <div className="admin-loading">Đang tải danh sách voucher...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã Code</th>
              <th>Mô tả</th>
              <th>Mức giảm</th>
              <th>Đơn tối thiểu</th>
              <th>Độc quyền App</th>
              <th>1 lần / Khách</th>
              <th>Lượt dùng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v) => (
              <tr key={v.id}>
                <td>
                  <strong style={{ color: 'var(--primary, #2d5a2d)', letterSpacing: '0.5px' }}>{v.code}</strong>
                </td>
                <td style={{ maxWidth: '240px', fontSize: '0.85rem' }}>{v.description}</td>
                <td>
                  {v.discountPercent ? (
                    <span>
                      Giảm <strong>{v.discountPercent}%</strong>
                      {v.maxDiscount ? <small style={{ display: 'block', color: '#666' }}>Tối đa {formatPrice(v.maxDiscount)}</small> : null}
                    </span>
                  ) : (
                    <span>Giảm <strong>{formatPrice(v.discountAmountFixed)}</strong></span>
                  )}
                </td>
                <td>{v.minOrderValue ? formatPrice(v.minOrderValue) : '0₫'}</td>
                <td>
                  {v.appOnly ? (
                    <span style={{ color: '#2e7d32', fontWeight: 600, fontSize: '0.82rem', background: '#e8f5e9', padding: '2px 8px', borderRadius: '6px' }}>
                      📱 App Only
                    </span>
                  ) : (
                    <span style={{ color: '#666', fontSize: '0.82rem' }}>🌐 Cả Web</span>
                  )}
                </td>
                <td>
                  {v.oncePerCustomer ? (
                    <span style={{ color: '#d32f2f', fontSize: '0.82rem', fontWeight: 600 }}>1 lần duy nhất</span>
                  ) : (
                    <span style={{ color: '#666', fontSize: '0.82rem' }}>Không giới hạn</span>
                  )}
                </td>
                <td>
                  <strong>{v.usedCount || 0}</strong> / {v.usageLimit}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(v)}
                    style={{
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      background: v.active ? '#e8f5e9' : '#ffebee',
                      color: v.active ? '#2e7d32' : '#c62828'
                    }}
                  >
                    {v.active ? 'Đang bật' : 'Đã khóa'}
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleDelete(v)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#d32f2f',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 600
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {vouchers.length === 0 && (
              <tr>
                <td colSpan="9" className="admin-empty">Chưa có mã giảm giá nào trong hệ thống.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal tạo voucher mới */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '520px',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--primary, #2d5a2d)' }}>Thêm Mã Giảm Giá Mới</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Mã Voucher *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: BANMAI15"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Mô tả chương trình</label>
                <input
                  type="text"
                  placeholder="VD: Giảm 15% mừng tuần lễ xanh"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Loại giảm giá</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  >
                    <option value="percent">Theo phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (₫)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    {form.discountType === 'percent' ? 'Mức giảm (%)' : 'Số tiền giảm (₫)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.discountType === 'percent' ? form.discountPercent : form.discountAmountFixed}
                    onChange={(e) => setForm({
                      ...form,
                      [form.discountType === 'percent' ? 'discountPercent' : 'discountAmountFixed']: e.target.value
                    })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>

              {form.discountType === 'percent' && (
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Giảm tối đa (₫)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 = Không giới hạn trần"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Đơn tối thiểu (₫)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderValue}
                    onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Lượt sử dụng</label>
                  <input
                    type="number"
                    min="1"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '0.88rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.appOnly}
                    onChange={(e) => setForm({ ...form, appOnly: e.target.checked })}
                  />
                  📱 Chỉ áp dụng trên App
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.oncePerCustomer}
                    onChange={(e) => setForm({ ...form, oncePerCustomer: e.target.checked })}
                  />
                  🔒 1 lần duy nhất/khách
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                >
                  Lưu Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
