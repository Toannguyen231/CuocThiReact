import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { formatPrice, getApiUrl } from '../../utils/api'

const ROLES = [
  { value: 'customer', label: 'Khách hàng', icon: '👤', color: '#0284c7' },
  { value: 'staff', label: 'Nhân viên', icon: '👨‍💼', color: '#16a34a' },
  { value: 'admin', label: 'Quản trị viên', icon: '👑', color: '#b45309' }
]

export default function AdminUsers() {
  const { token } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState('all') // 'all' | 'customer' | 'staff' | 'admin' | 'locked'
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [passwordUser, setPasswordUser] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
    status: 'active'
  })
  const [newPassword, setNewPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(getApiUrl('/api/admin/users'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token])

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'customer',
      status: 'active'
    })
    setFormError('')
    setShowCreateModal(true)
  }

  // Create User submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!formData.name.trim()) return setFormError('Vui lòng nhập họ và tên')
    if (!formData.password || formData.password.length < 6) {
      return setFormError('Mật khẩu phải có ít nhất 6 ký tự')
    }

    setSubmitting(true)
    try {
      const res = await fetch(getApiUrl('/api/admin/users'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.message || 'Lỗi khi tạo tài khoản')
      } else {
        setShowCreateModal(false)
        fetchUsers()
      }
    } catch (err) {
      setFormError('Lỗi kết nối máy chủ')
    } finally {
      setSubmitting(false)
    }
  }

  // Edit User submit
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${editingUser.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.message || 'Lỗi khi cập nhật')
      } else {
        setEditingUser(null)
        fetchUsers()
      }
    } catch (err) {
      setFormError('Lỗi kết nối máy chủ')
    } finally {
      setSubmitting(false)
    }
  }

  // Change Password submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!newPassword || newPassword.length < 6) {
      return setFormError('Mật khẩu mới phải có ít nhất 6 ký tự')
    }

    setSubmitting(true)
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${passwordUser.id}/password`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.message || 'Lỗi khi đổi mật khẩu')
      } else {
        setPasswordUser(null)
        setNewPassword('')
        alert('Đặt lại mật khẩu thành công!')
      }
    } catch (err) {
      setFormError('Lỗi kết nối máy chủ')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete User
  const handleDeleteConfirm = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${deletingUser.id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.message || 'Không thể xóa tài khoản')
      } else {
        setDeletingUser(null)
        fetchUsers()
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ')
    } finally {
      setSubmitting(false)
    }
  }

  // Toggle status (active / locked)
  const handleToggleStatus = async (user) => {
    if (user.isPrimaryAdmin) {
      return alert('Không thể khóa Quản trị viên hệ thống')
    }
    const newStatus = user.status === 'locked' ? 'active' : 'locked'
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${user.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) fetchUsers()
    } catch (err) {
      console.error(err)
    }
  }

  // Filter & Search
  const filteredUsers = users.filter((u) => {
    // Role / status filter
    if (filterRole === 'locked') {
      if (u.status !== 'locked') return false
    } else if (filterRole !== 'all') {
      if (u.role !== filterRole) return false
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = (u.name || '').toLowerCase().includes(q)
      const matchEmail = (u.email || '').toLowerCase().includes(q)
      const matchPhone = (u.phone || '').includes(q)
      const matchUsername = (u.username || '').toLowerCase().includes(q)
      return matchName || matchEmail || matchPhone || matchUsername
    }

    return true
  })

  // Counts
  const totalCount = users.length
  const customerCount = users.filter((u) => u.role === 'customer').length
  const staffAdminCount = users.filter((u) => u.role === 'admin' || u.role === 'staff').length
  const lockedCount = users.filter((u) => u.status === 'locked').length

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div>
            <h1>👥 Quản Lý Tài Khoản</h1>
            <p>Quản lý tài khoản khách hàng, nhân viên tư vấn và phân quyền quản trị</p>
          </div>
          <button type="button" className="btn-create-user" onClick={handleOpenCreate}>
            <span>+</span> Thêm tài khoản mới
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="admin-stat-card stat-orders">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{totalCount}</h3>
            <p>Tổng tài khoản</p>
          </div>
        </div>
        <div className="admin-stat-card stat-products">
          <div className="stat-icon">🛍️</div>
          <div className="stat-info">
            <h3>{customerCount}</h3>
            <p>Khách hàng đã đăng ký</p>
          </div>
        </div>
        <div className="admin-stat-card stat-revenue">
          <div className="stat-icon">👑</div>
          <div className="stat-info">
            <h3>{staffAdminCount}</h3>
            <p>Quản trị & Nhân viên</p>
          </div>
        </div>
        <div className="admin-stat-card stat-pending">
          <div className="stat-icon">🔒</div>
          <div className="stat-info">
            <h3>{lockedCount}</h3>
            <p>Tài khoản đang khóa</p>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="admin-users-controls">
        <div className="admin-filter-bar" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`admin-filter-btn ${filterRole === 'all' ? 'active' : ''}`}
            onClick={() => setFilterRole('all')}
          >
            Tất cả ({totalCount})
          </button>
          <button
            type="button"
            className={`admin-filter-btn ${filterRole === 'customer' ? 'active' : ''}`}
            onClick={() => setFilterRole('customer')}
          >
            👤 Khách hàng ({customerCount})
          </button>
          <button
            type="button"
            className={`admin-filter-btn ${filterRole === 'staff' ? 'active' : ''}`}
            onClick={() => setFilterRole('staff')}
          >
            👨‍💼 Nhân viên
          </button>
          <button
            type="button"
            className={`admin-filter-btn ${filterRole === 'admin' ? 'active' : ''}`}
            onClick={() => setFilterRole('admin')}
          >
            👑 Quản trị
          </button>
          <button
            type="button"
            className={`admin-filter-btn ${filterRole === 'locked' ? 'active' : ''}`}
            onClick={() => setFilterRole('locked')}
          >
            🔒 Bị khóa ({lockedCount})
          </button>
        </div>

        {/* Search */}
        <div className="admin-users-search-wrap">
          <input
            type="text"
            placeholder="🔍 Tìm theo tên, email, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-table-wrapper" style={{ background: '#fff', borderRadius: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {loading ? (
          <div className="admin-loading">Đang tải danh sách tài khoản...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-chat-empty">
            <p>Không tìm thấy tài khoản nào phù hợp.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Liên hệ</th>
                <th>Vai trò</th>
                <th>Đơn hàng</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const roleObj = ROLES.find((r) => r.value === user.role) || ROLES[0]
                const isLocked = user.status === 'locked'
                const dateStr = user.created_at
                  ? new Date(user.created_at).toLocaleDateString('vi-VN')
                  : '—'

                return (
                  <tr key={user.id} className={isLocked ? 'user-row-locked' : ''}>
                    {/* User info */}
                    <td>
                      <div className="admin-user-cell">
                        <div
                          className="session-avatar"
                          style={{
                            width: 38,
                            height: 38,
                            background: user.role === 'admin'
                              ? 'linear-gradient(135deg, #b45309, #d97706)'
                              : user.role === 'staff'
                              ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                              : 'linear-gradient(135deg, var(--primary), var(--primary-light))'
                          }}
                        >
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <strong style={{ color: 'var(--primary-dark)', display: 'block', fontSize: '0.92rem' }}>
                            {user.name}
                          </strong>
                          <small style={{ color: 'var(--text-light)', fontSize: '0.78rem' }}>
                            ID: #{user.id} {user.isPrimaryAdmin && '• Quản trị chính'}
                          </small>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {user.email && <div style={{ color: 'var(--text-primary)' }}>📧 {user.email}</div>}
                        {user.phone ? (
                          <div style={{ color: 'var(--primary)', fontWeight: 600 }}>📞 {user.phone}</div>
                        ) : (
                          <small style={{ color: 'var(--text-light)' }}>Chưa có SĐT</small>
                        )}
                      </div>
                    </td>

                    {/* Role */}
                    <td>
                      <span
                        className="user-role-badge"
                        style={{
                          background: `${roleObj.color}15`,
                          color: roleObj.color,
                          border: `1px solid ${roleObj.color}35`
                        }}
                      >
                        {roleObj.icon} {roleObj.label}
                      </span>
                    </td>

                    {/* Orders summary */}
                    <td>
                      {user.role === 'customer' ? (
                        <div style={{ fontSize: '0.82rem' }}>
                          <strong>{user.orderCount || 0}</strong> đơn
                          {user.totalSpent > 0 && (
                            <div style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.78rem' }}>
                              {formatPrice(user.totalSpent)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>Nội bộ</span>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <button
                        type="button"
                        className={`status-toggle-btn ${isLocked ? 'locked' : 'active'}`}
                        onClick={() => handleToggleStatus(user)}
                        title={isLocked ? 'Bấm để mở khóa' : 'Bấm để tạm khóa'}
                        disabled={user.isPrimaryAdmin}
                      >
                        {isLocked ? '🔒 Đã khóa' : '🟢 Hoạt động'}
                      </button>
                    </td>

                    {/* Date */}
                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {dateStr}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="user-action-buttons">
                        {/* Edit */}
                        <button
                          type="button"
                          className="user-btn-action"
                          title="Chỉnh sửa thông tin"
                          onClick={() => {
                            setEditingUser(user)
                            setFormData({
                              name: user.name || '',
                              email: user.email || '',
                              phone: user.phone || '',
                              role: user.role || 'customer',
                              status: user.status || 'active'
                            })
                            setFormError('')
                          }}
                        >
                          ✏️
                        </button>

                        {/* Change Password */}
                        <button
                          type="button"
                          className="user-btn-action"
                          title="Đổi / Đặt lại mật khẩu"
                          onClick={() => {
                            setPasswordUser(user)
                            setNewPassword('')
                            setFormError('')
                          }}
                        >
                          🔑
                        </button>

                        {/* Delete */}
                        {!user.isPrimaryAdmin && (
                          <button
                            type="button"
                            className="user-btn-action user-btn-action--delete"
                            title="Xóa tài khoản"
                            onClick={() => setDeletingUser(user)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── MODAL: Thêm tài khoản mới ─── */}
      {showCreateModal && (
        <div className="zalo-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>✨ Thêm Tài Khoản Mới</h3>
              <button type="button" className="zalo-modal-close" onClick={() => setShowCreateModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="admin-modal-form">
              {formError && <div className="admin-form-error">{formError}</div>}

              <div className="admin-form-group">
                <label>Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@gmail.com"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0901234567"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Mật khẩu ban đầu *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>
                <div className="admin-form-group">
                  <label>Phân quyền (Vai trò)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="customer">👤 Khách hàng</option>
                    <option value="staff">👨‍💼 Nhân viên tư vấn</option>
                    <option value="admin">👑 Quản trị viên</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={submitting}
                >
                  {submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Chỉnh sửa tài khoản ─── */}
      {editingUser && (
        <div className="zalo-modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>✏️ Chỉnh Sửa Tài Khoản #{editingUser.id}</h3>
              <button type="button" className="zalo-modal-close" onClick={() => setEditingUser(null)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="admin-modal-form">
              {formError && <div className="admin-form-error">{formError}</div>}

              <div className="admin-form-group">
                <label>Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {!editingUser.isPrimaryAdmin && (
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Vai trò</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="customer">👤 Khách hàng</option>
                      <option value="staff">👨‍💼 Nhân viên tư vấn</option>
                      <option value="admin">👑 Quản trị viên</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Trạng thái</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">🟢 Đang hoạt động</option>
                      <option value="locked">🔒 Tạm khóa</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setEditingUser(null)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Đổi mật khẩu ─── */}
      {passwordUser && (
        <div className="zalo-modal-overlay" onClick={() => setPasswordUser(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>🔑 Đặt Lại Mật Khẩu</h3>
              <button type="button" className="zalo-modal-close" onClick={() => setPasswordUser(null)}>
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="admin-modal-form">
              {formError && <div className="admin-form-error">{formError}</div>}

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
                Đặt mật khẩu mới cho tài khoản <strong>{passwordUser.name}</strong> ({passwordUser.email || passwordUser.phone}):
              </p>

              <div className="admin-form-group">
                <label>Mật khẩu mới *</label>
                <input
                  type="password"
                  required
                  placeholder="Nhập ít nhất 6 ký tự..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setPasswordUser(null)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={submitting}
                >
                  {submitting ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Xác nhận xóa ─── */}
      {deletingUser && (
        <div className="zalo-modal-overlay" onClick={() => setDeletingUser(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>⚠️ Xác Nhận Xóa Tài Khoản</h3>
              <button type="button" className="zalo-modal-close" onClick={() => setDeletingUser(null)}>
                ✕
              </button>
            </div>

            <div style={{ padding: '1.25rem 0', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              Bạn có chắc chắn muốn xóa tài khoản <strong>{deletingUser.name}</strong> ({deletingUser.email || deletingUser.phone}) không?
              <br />
              <small style={{ color: '#dc2626', display: 'block', marginTop: '0.5rem' }}>
                Hành động này không thể hoàn tác. Lịch sử chat và dữ liệu cá nhân sẽ bị xóa.
              </small>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setDeletingUser(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn-danger-action"
                onClick={handleDeleteConfirm}
                disabled={submitting}
              >
                {submitting ? 'Đang xóa...' : 'Đồng ý xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
