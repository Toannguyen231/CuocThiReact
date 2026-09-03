import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import PageLoader from './components/layout/PageLoader'
import BackToTop from './components/layout/BackToTop'
import CartDrawer from './components/ui/CartDrawer'
import SupportHub from './components/ui/SupportHub'

import HomePage from './pages/HomePage'
import StoryPage from './pages/StoryPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import B2BGiftsPage from './pages/B2BGiftsPage'
import SocialImpactPage from './pages/SocialImpactPage'
import GuidePage from './pages/GuidePage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import AccountPage from './pages/AccountPage'

import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminProducts from './pages/admin/AdminProducts'
import AdminLiveChat from './pages/admin/AdminLiveChat'
import AdminUsers from './pages/admin/AdminUsers'
import AdminLayout from './components/admin/AdminLayout'
import ProtectedRoute from './components/admin/ProtectedRoute'
import { usePageReveals } from './hooks/useAnimations'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const hasPageHero = [
    '/',
    '/index.html',
    '/cau-chuyen',
    '/cau-chuyen.html',
    '/san-pham',
    '/san-pham.html',
    '/qua-tang-doanh-nghiep',
    '/qua-tang-doanh-nghiep.html',
    '/tac-dong-xa-hoi',
    '/tac-dong-xa-hoi.html',
    '/cam-nang',
    '/cam-nang.html'
  ].includes(location.pathname)
  usePageReveals([location.pathname, location.search])

  return (
    <>
      <PageLoader />
      <ScrollToTop />
      {!isAdmin && <Navbar solid={!hasPageHero} />}
      {!isAdmin && <CartDrawer />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/index.html" element={<HomePage />} />
        <Route path="/cau-chuyen" element={<StoryPage />} />
        <Route path="/cau-chuyen.html" element={<StoryPage />} />
        <Route path="/san-pham" element={<ProductsPage />} />
        <Route path="/san-pham.html" element={<ProductsPage />} />
        <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
        <Route path="/qua-tang-doanh-nghiep" element={<B2BGiftsPage />} />
        <Route path="/qua-tang-doanh-nghiep.html" element={<B2BGiftsPage />} />
        <Route path="/tac-dong-xa-hoi" element={<SocialImpactPage />} />
        <Route path="/tac-dong-xa-hoi.html" element={<SocialImpactPage />} />
        <Route path="/cam-nang" element={<GuidePage />} />
        <Route path="/cam-nang.html" element={<GuidePage />} />
        <Route path="/gio-hang" element={<CartPage />} />
        <Route path="/thanh-toan" element={<CheckoutPage />} />
        <Route path="/dat-hang-thanh-cong/:id" element={<OrderSuccessPage />} />
        <Route path="/dang-nhap" element={<AccountPage />} />
        <Route path="/dang-ky" element={<AccountPage />} />
        <Route path="/tai-khoan" element={<AccountPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="chat" element={<AdminLiveChat />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>

      {!isAdmin && <Footer />}
      {!isAdmin && <SupportHub />}
      <BackToTop />
    </>
  )
}

export default App
