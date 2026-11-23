import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  AlertTriangle,
  Plus,
  MessageCircle,
} from "lucide-react";
import { api } from "../../lib/api";

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const orderNo = (o) => "#" + o._id.slice(-5).toUpperCase();

const STATUS_STYLE = {
  New: "bg-blue-100 text-blue-700",
  Confirmed: "bg-yellow-100 text-yellow-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

function StatCard({ title, value, change, icon: Icon, highlight }) {
  const up = change >= 0;
  return (
    <div className={`rounded-xl border p-5 ${highlight ? "border-orange-300 bg-orange-50" : "bg-white"}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <span className={`rounded-lg p-2 ${highlight ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {change !== undefined && (
        <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${up ? "text-green-600" : "text-red-600"}`}>
          {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(change)}% vs last week
        </p>
      )}
    </div>
  );
}

function OrdersChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.orders));
  return (
    <div className="flex h-56 items-end gap-3 sm:gap-5">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-semibold text-gray-600">{d.orders}</span>
          <div className="flex h-40 w-full items-end">
            <div
              className="w-full rounded-t-md bg-orange-500 transition hover:bg-orange-600"
              style={{ height: `${Math.max((d.orders / max) * 100, 2)}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/stats").then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="rounded-lg bg-red-50 p-4 text-red-700">Could not load dashboard: {error}</p>;
  if (!stats) return <p className="text-gray-500">Loading dashboard...</p>;

  const { totals, ordersByDay, recentOrders, topProducts, lowStock } = stats;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of your store this week</p>
        </div>
        <Link
          to="/admin/products"
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Website Orders (7 days)" value={totals.orders} change={totals.ordersChange} icon={MessageCircle} highlight />
        <StatCard title="Revenue (7 days)" value={inr(totals.revenue)} change={totals.revenueChange} icon={IndianRupee} />
        <StatCard title="Products" value={totals.products} icon={Package} />
        <StatCard title="Customers" value={totals.customers} icon={Users} />
      </div>
      <p className="-mt-3 text-xs text-gray-500">
        Total website orders so far: <b>{totals.allOrders}</b>
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Orders from website (last 7 days)</h2>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
              {totals.orders} total
            </span>
          </div>
          <OrdersChart data={ordersByDay} />
        </section>

        <section className="rounded-xl border bg-white p-5">
          <h2 className="mb-4 font-semibold text-gray-900">Top selling products</h2>
          {topProducts.length === 0 && <p className="text-sm text-gray-500">No orders yet.</p>}
          <ul className="space-y-4">
            {topProducts.map((p, i) => (
              <li key={p.name} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-gray-800">{p.name}</span>
                <span className="text-sm font-semibold text-gray-900">{p.sold}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-white lg:col-span-2">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="font-semibold text-gray-900">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-orange-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                      No orders yet. They appear here when customers tap “Order on WhatsApp”.
                    </td>
                  </tr>
                )}
                {recentOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-semibold text-gray-900">
                      {orderNo(o)}
                      <div className="text-xs font-normal text-gray-400">
                        {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">{inr(o.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
            <AlertTriangle size={18} className="text-orange-500" /> Low stock
          </h2>
          {lowStock.length === 0 && <p className="text-sm text-gray-500">All products are well stocked.</p>}
          <ul className="space-y-3">
            {lowStock.map((p) => (
              <li key={p._id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                <span className="text-sm text-gray-800">{p.name}</span>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                  {p.stock} left
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
