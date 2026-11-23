import { useState } from "react";
import { NavLink, Outlet, Link, Navigate, useNavigate } from "react-router-dom";
import { getToken, clearToken } from "../../lib/api";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tags,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Wrench,
  Store,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin", end: true },
  { label: "Orders", icon: ShoppingBag, to: "/admin/orders" },
  { label: "Products", icon: Package, to: "/admin/products" },
  { label: "Categories", icon: Tags, to: "/admin/categories" },
  { label: "Customers", icon: Users, to: "/admin/customers" },
  { label: "Settings", icon: Settings, to: "/admin/settings" },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Not logged in -> go to the login page
  if (!getToken()) return <Navigate to="/admin/login" replace />;

  const logout = () => {
    clearToken();
    navigate("/admin/login");
  };

  const Sidebar = (
    <div className="flex h-full flex-col bg-gray-900 text-gray-300">
      <div className="flex items-center gap-2 px-5 py-5 text-lg font-extrabold text-white">
        <span className="rounded-lg bg-orange-500 p-1.5">
          <Wrench size={18} />
        </span>
        Admin Panel
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV.map(({ label, icon: Icon, to, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-orange-500 text-white" : "hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-gray-800 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gray-800 hover:text-white">
          <Store size={18} /> View Store
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-gray-800 hover:text-white">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{Sidebar}</aside>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? "visible" : "invisible"}`}>
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-64 transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button onClick={() => setOpen(false)} className="absolute right-3 top-4 text-gray-400" aria-label="Close">
            <X size={20} />
          </button>
          {Sidebar}
        </aside>
      </div>

      {/* Main */}
      <div className="min-w-0 flex-1 lg:ml-64">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b bg-white px-4 py-3">
          <button onClick={() => setOpen(true)} className="rounded-md p-2 hover:bg-gray-100 lg:hidden" aria-label="Menu">
            <Menu size={22} />
          </button>
          <div className="relative hidden max-w-sm flex-1 sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search orders, products..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative rounded-md p-2 hover:bg-gray-100" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
              A
            </div>
          </div>
        </header>

        {/* The active admin page renders here */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
