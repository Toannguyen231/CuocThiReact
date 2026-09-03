import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAdmin, loading } = useAuth()

  if (loading) return <div className="admin-loading">Đang tải...</div>
  if (!isAdmin) return <Navigate to="/admin/login" replace />
  return children
}
