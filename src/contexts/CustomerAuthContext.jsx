import { createContext, useContext, useEffect, useState } from 'react'

const CustomerAuthContext = createContext()
const TOKEN_KEY = 'chieunau_customer_token'

export function CustomerAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    fetch('/api/customer/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setCustomer(data.user)
        setLoading(false)
      })
      .catch(() => {
        logout()
        setLoading(false)
      })
  }, [token])

  const persistSession = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    setCustomer(data.user)
    return data
  }

  const login = async (identifier, password) => {
    const res = await fetch('/api/customer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại')
    return persistSession(data)
  }

  const register = async ({ name, email, phone, password }) => {
    const res = await fetch('/api/customer/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Đăng ký thất bại')
    return persistSession(data)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setCustomer(null)
  }

  return (
    <CustomerAuthContext.Provider value={{ token, customer, isCustomer: !!customer, loading, login, register, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext)
  if (!context) throw new Error('useCustomerAuth must be used within CustomerAuthProvider')
  return context
}
