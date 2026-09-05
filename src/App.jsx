import { Routes, Route, useLocation, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import PageLoader from './components/layout/PageLoader'
import BackToTop from './components/layout/BackToTop'
import CartDrawer from './components/ui/CartDrawer'
import SupportHub from './components/ui/SupportHub'
import PWAInstallBanner from './components/ui/PWAInstallBanner'
import PWAUpdateToast from './components/ui/PWAUpdateToast'

import AppSplash from './components/app/AppSplash'
import BottomTabBar from './components/app/BottomTabBar'
import AppPromoBanner from './components/app/AppPromoBanner'
import ExploreSheet from './components/app/ExploreSheet'

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
import OfflinePage from './pages/OfflinePage'
import VerifyPage from './pages/VerifyPage'

import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminProducts from './pages/admin/AdminProducts'
import AdminVouchers from './pages/admin/AdminVouchers'
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
  const [isExploreOpen, setIsExploreOpen] = useState(false)
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
      {/* Splash screen PWA độc quyền (tự kiểm tra điều kiện isApp bên trong component) */}
      <AppSplash />

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
        <Route path="/offline" element={<OfflinePage />} />
        <Route path="/quet-ma" element={<VerifyPage />} />
        <Route path="/quet-ma.html" element={<VerifyPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="vouchers" element={<AdminVouchers />} />
          <Route path="chat" element={<AdminLiveChat />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* 404 Fallback Route */}
        <Route
          path="*"
          element={
            <div style={{ textAlign: 'center', padding: '6rem 2rem', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h1 style={{ fontSize: '4rem', color: 'var(--primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>404</h1>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary-dark)' }}>Không tìm thấy trang</h2>
              <p style={{ fontSize: '1rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', maxWidth: '460px' }}>
                Đường dẫn bạn yêu cầu không tồn tại hoặc đã được cập nhật. Vui lòng quay về trang chủ để tiếp tục khám phá Chiếu Nẫu.
              </p>
              <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
                Quay về Trang chủ
              </Link>
            </div>
          }
        />
      </Routes>

      {!isAdmin && <Footer />}
      {!isAdmin && <SupportHub />}
      <BackToTop />
      {!isAdmin && <PWAInstallBanner />}
      {!isAdmin && <PWAUpdateToast />}

      {/* App-mode components (Bottom Tab Bar, Khám Phá Sheet và Banner Voucher APP10) */}
      <BottomTabBar
        onOpenExplore={() => setIsExploreOpen(true)}
        isExploreOpen={isExploreOpen}
      />
      <ExploreSheet
        isOpen={isExploreOpen}
        onClose={() => setIsExploreOpen(false)}
      />
      <AppPromoBanner />
    </>
  )
}

export default App
