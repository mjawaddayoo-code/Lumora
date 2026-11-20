import { Route, Routes, Link } from 'react-router-dom';
import Layout from './components/Layout';
import { RequireAdmin, RequireAuth } from './components/Guards';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import { Orders, OrderDetail } from './pages/Orders';
import Wishlist from './pages/Wishlist';
import { Login, Register } from './pages/Auth';
import Profile from './pages/Profile';
import { About, Contact } from './pages/Info';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminMessages from './pages/admin/AdminMessages';
import AdminBanners from './pages/admin/AdminBanners';

const NotFound = () => (
  <div className="container-x py-24 text-center">
    <h1 className="text-6xl font-bold text-brand-600">404</h1>
    <p className="mt-2 text-ink/60">We couldn't find that page.</p>
    <Link to="/" className="btn-primary mt-6">Back to home</Link>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:slug" element={<ProductDetails />} />
        <Route path="cart" element={<RequireAuth><Cart /></RequireAuth>} />
        <Route path="checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
        <Route path="orders" element={<RequireAuth><Orders /></RequireAuth>} />
        <Route path="orders/:id" element={<RequireAuth><OrderDetail /></RequireAuth>} />
        <Route path="wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
        <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="banners" element={<AdminBanners />} />
      </Route>
    </Routes>
  );
}
