import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAdmin, loading } = useAuth()

  // Trong lúc đang xác thực token — KHÔNG hiển thị bất kỳ nội dung admin nào
  if (loading) {
    return (
      <div className="admin-loading" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e0e0e0',
          borderTopColor: '#4a7c59',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ color: '#666', fontSize: '0.9rem' }}>Đang xác thực quyền truy cập...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Nếu xác thực xong mà không phải admin → chuyển hướng về trang đăng nhập
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
