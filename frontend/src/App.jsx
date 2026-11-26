import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Link,
  useLocation,
} from "react-router-dom";

import { useEffect } from "react";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { CartProvider } from "./context/CartContext";
import {
  Orders,
  Products,
  Categories,
  Customers,
  SettingsPage,
  Deals as AdminDeals,
} from "./pages/admin/AdminPages";

// Customer pages
import Shop from "./pages/Shop";
import AllCategories from "./pages/Categories";
import ProductDetail from "./pages/ProductDetail";
import DealsPage from "./pages/Deals";
import ContactPage from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
// import { CartProvider } from "./context/CartContext";

// Scroll to top whenever the page changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Public store layout
function ShopLayout() {
  return (
    <>
    <Navbar />
    <Outlet />
    </>
  );
}

// Temporary page
function Placeholder({ title }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-gray-900">
        {title}
      </h1>

      <p className="mt-2 text-gray-500">
        This page is coming soon.
      </p>

      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
      >
        Back to Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
   <CartProvider>
      <BrowserRouter>
        <ScrollToTop />

        <Routes>
          {/* Public store pages */}
          <Route element={<ShopLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/categories" element={<AllCategories />} />
            <Route path="/product/:id" element={<ProductDetail />} />

            <Route
              path="/category/:name"
              element={<Placeholder title="Category" />}
            />

            <Route path="/deals" element={<DealsPage />} />

            <Route path="/contact" element={<ContactPage />} />

            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />

            <Route
              path="/order-success/:id"
              element={<OrderSuccess />}
            />

            <Route
              path="*"
              element={<Placeholder title="404 – Page not found" />}
            />
          </Route>

          {/* Admin login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="deals" element={<AdminDeals />} />
            <Route path="categories" element={<Categories />} />
            <Route path="customers" element={<Customers />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
} 