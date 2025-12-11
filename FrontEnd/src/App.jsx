import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import TrackOrderPage from './pages/TrackOrderPage.jsx'
import ClaimRefundPage from './pages/ClaimRefundPage.jsx'
import MyRefundsPage from './pages/MyRefundsPage.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage.jsx'
import AdminSystemPage from './pages/admin/AdminSystemPage.jsx'
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx'
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx'
import AdminRefundsPage from './pages/admin/AdminRefundsPage.jsx'
import AdminDiscountsPage from './pages/admin/AdminDiscountsPage.jsx'
import AdminPaymentMethodsPage from './pages/admin/AdminPaymentMethodsPage.jsx'
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage.jsx'
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx'
import AdminAddProductPage from './pages/admin/AdminAddProductPage.jsx'
import AdminEditProductPage from './pages/admin/AdminEditProductPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="track-order/:id" element={<TrackOrderPage />} />
        <Route path="refund/claim" element={<ClaimRefundPage />} />
        <Route path="refund/my-refunds" element={<MyRefundsPage />} />
      </Route>
      <Route path="/admin/*" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="system" element={<AdminSystemPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/add" element={<AdminAddProductPage />} />
        <Route path="products/edit/:id" element={<AdminEditProductPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="refunds" element={<AdminRefundsPage />} />
        <Route path="discounts" element={<AdminDiscountsPage />} />
        <Route path="payment-methods" element={<AdminPaymentMethodsPage />} />
        <Route path="announcements" element={<AdminAnnouncementsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
      {/* 404 Not Found page */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">404 Not Found</h1>
              <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App
