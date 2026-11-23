import { BrowserRouter, Routes, Route, Outlet, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { Orders, Products, Categories, Customers, SettingsPage } from "./pages/admin/AdminPages";

// Scrolls to the top whenever the page changes
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Layout for all public pages (navbar on top, page content below)
function ShopLayout() {
  return (
    <>
      <Navbar cartCount={0} />
      <Outlet />
    </>
  );
}

// Temporary page for routes you haven't built yet
function Placeholder({ title }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-500">This page is coming soon.</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">
        Back to Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public store pages (with navbar) */}
        <Route element={<ShopLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Placeholder title="Shop" />} />
          <Route path="/category/:name" element={<Placeholder title="Category" />} />
          <Route path="/deals" element={<Placeholder title="Deals" />} />
          <Route path="/contact" element={<Placeholder title="Contact Us" />} />
          <Route path="/cart" element={<Placeholder title="Your Cart" />} />
          <Route path="/account" element={<Placeholder title="My Account" />} />
          <Route path="*" element={<Placeholder title="404 – Page not found" />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin (own sidebar layout, no store navbar) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="customers" element={<Customers />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
