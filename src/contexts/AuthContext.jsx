import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getApiUrl } from '../utils/api'

const AuthContext = createContext()

const TOKEN_KEY = 'chieunau_admin_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setAdmin(null)
  }, [])

  useEffect(() => {
    if (!token) {
      setAdmin(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()

    const verifyToken = async () => {
      try {
        const res = await fetch(getApiUrl('/api/auth/me'), {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal
        })

        // Kiểm tra content-type phải là JSON (phòng trường hợp Vercel SPA rewrite trả về HTML)
        const contentType = res.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          throw new Error('Response is not JSON — likely no backend configured')
        }

        if (!res.ok) {
          throw new Error('Token invalid or expired')
        }

        const data = await res.json()

        // Kiểm tra response phải có cấu trúc hợp lệ từ server
        if (!data || !data.user || !data.user.username) {
          throw new Error('Invalid response structure')
        }

        setAdmin(data.user)
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Admin auth verification failed:', err.message)
          logout()
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    verifyToken()

    return () => controller.abort()
  }, [token, logout])

  const login = async (username, password) => {
    const res = await fetch(getApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      throw new Error('Không thể kết nối tới máy chủ. Vui lòng thử lại sau.')
    }

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Đăng nhập thất bại')
    }

    const data = await res.json()

    if (!data.token || !data.user) {
      throw new Error('Phản hồi từ máy chủ không hợp lệ')
    }

    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    setAdmin(data.user)
    return data
  }

  const isAdmin = !!admin

  return (
    <AuthContext.Provider value={{ token, admin, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
