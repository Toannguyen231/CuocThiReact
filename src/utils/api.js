export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

export function getApiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${cleanPath}`
}

async function request(url, options = {}) {
  const token = localStorage.getItem('chieunau_admin_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`
  
  const res = await fetch(getApiUrl(`/api${url.startsWith('/') ? url : `/${url}`}`), { ...options, headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Lỗi server')
  return data
}

export const api = {
  // Products
  getProducts: (category) => request(`/products${category ? `?category=${category}` : ''}`),
  getProduct: (slug) => request(`/products/${slug}`),

  // Orders
  createOrder: (orderData) => request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getOrder: (id) => request(`/orders/${id}`),

  // Auth
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => request('/auth/me'),

  // Admin
  getDashboard: () => request('/admin/dashboard'),
  getAdminOrders: (params = '') => request(`/admin/orders${params ? `?${params}` : ''}`),
  getAdminOrder: (id) => request(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => request(`/admin/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getAdminProducts: () => request('/admin/products'),
  updateProduct: (id, data) => request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}

export function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫'
}
