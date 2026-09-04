import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider } from './contexts/AuthContext'
import { CustomerAuthProvider } from './contexts/CustomerAuthContext'
import './styles/index.css'
import './styles/cart.css'
import './styles/admin.css'
import './styles/auth.css'
import './styles/map-picker.css'
import './styles/support-hub.css'
import './styles/app-mode.css'

// Đăng ký Service Worker qua virtual:pwa-register với cơ chế prompt
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('PWA: Có bản cập nhật mới sẵn sàng.')
  },
  onOfflineReady() {
    console.log('PWA: Ứng dụng đã sẵn sàng hoạt động offline.')
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CustomerAuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </CustomerAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
