import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Cog } from "lucide-react";
import { api } from "../../lib/api";

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const orderNo = (o) => "#" + o._id.slice(-5).toUpperCase();
const STATUSES = ["New", "Confirmed", "Delivered", "Cancelled"];
const STATUS_STYLE = {
  New: "bg-blue-100 text-blue-700",
  Confirmed: "bg-yellow-100 text-yellow-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};
const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500";

// ---------- shared bits ----------
function useFetch(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const reload = useCallback(() => {
    api.get(path).then(setData).catch((e) => setError(e.message));
  }, [path]);
  useEffect(reload, [reload]);
  return { data, error, reload, setData };
}

function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function AddButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
    >
      <Plus size={16} /> {children}
    </button>
  );
}

function Table({ head, children }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-5 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  );
}

function Empty({ cols, text }) {
  return (
    <tr>
      <td colSpan={cols} className="px-5 py-10 text-center text-gray-500">{text}</td>
    </tr>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function Loading({ error }) {
  return error ? (
    <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
  ) : (
    <p className="text-gray-500">Loading...</p>
  );
}

// ---------- Products ----------
const EMPTY_PRODUCT = {
  name: "", brand: "", category: "", price: "", oldPrice: "", stock: "", rating: "4", tag: "", image: "", description: "",
};

export function Products() {
  const products = useFetch("/products");
  const categories = useFetch("/categories");
  const [editing, setEditing] = useState(null); // null | {} (new) | product
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const openForm = (p) => {
    setError("");
    setEditing(p || {});
    setForm(p ? { ...EMPTY_PRODUCT, ...p } : EMPTY_PRODUCT);
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const body = {
      ...form,
      price: Number(form.price),
      oldPrice: Number(form.oldPrice) || 0,
      stock: Number(form.stock) || 0,
      rating: Number(form.rating) || 0,
    };
    try {
      editing._id ? await api.put(`/products/${editing._id}`, body) : await api.post("/products", body);
      setEditing(null);
      products.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? It will disappear from the store.`)) return;
    try {
      await api.del(`/products/${p._id}`);
      products.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!products.data) return <Loading error={products.error} />;
  const rows = products.data.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${products.data.length} products in your store`}
        action={<AddButton onClick={() => openForm()}>Add Product</AddButton>}
      />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className={`${inputCls} mb-4 max-w-xs bg-white`}
      />
      <Table head={["Product", "Category", "Price", "Stock", "Actions"]}>
        {rows.length === 0 && <Empty cols={5} text="No products yet. Click “Add Product” to create one." />}
        {rows.map((p) => (
          <tr key={p._id} className="hover:bg-gray-50">
            <td className="px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                  {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <Cog size={18} className="text-gray-300" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  {p.brand && <p className="text-xs text-gray-400">{p.brand}</p>}
                </div>
              </div>
            </td>
            <td className="px-5 py-3 text-gray-600">{p.category || "—"}</td>
            <td className="px-5 py-3 font-medium">{inr(p.price)}</td>
            <td className="px-5 py-3">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.stock <= 5 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                {p.stock} in stock
              </span>
            </td>
            <td className="px-5 py-3">
              <div className="flex gap-1 text-gray-500">
                <button onClick={() => openForm(p)} className="rounded p-1.5 hover:bg-gray-100 hover:text-orange-600" aria-label="Edit"><Pencil size={16} /></button>
                <button onClick={() => remove(p)} className="rounded p-1.5 hover:bg-gray-100 hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {editing && (
        <Modal title={editing._id ? "Edit Product" : "Add Product"} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-3">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <Field label="Product name *">
              <input required value={form.name} onChange={set("name")} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Brand"><input value={form.brand} onChange={set("brand")} className={inputCls} /></Field>
              <Field label="Category">
                <select value={form.category} onChange={set("category")} className={inputCls}>
                  <option value="">— none —</option>
                  {(categories.data || []).map((c) => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Price (₹) *">
                <input required type="number" min="0" value={form.price} onChange={set("price")} className={inputCls} />
              </Field>
              <Field label="Old price (₹)">
                <input type="number" min="0" value={form.oldPrice} onChange={set("oldPrice")} className={inputCls} />
              </Field>
              <Field label="Stock">
                <input type="number" min="0" value={form.stock} onChange={set("stock")} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rating (0–5)">
                <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={set("rating")} className={inputCls} />
              </Field>
              <Field label="Tag (e.g. New, Best Seller)">
                <input value={form.tag} onChange={set("tag")} className={inputCls} />
              </Field>
            </div>
            <Field label="Image URL">
              <input value={form.image} onChange={set("image")} placeholder="https://..." className={inputCls} />
            </Field>
            <Field label="Description">
              <textarea rows={3} value={form.description} onChange={set("description")} className={inputCls} />
            </Field>
            <button disabled={saving} className="w-full rounded-lg bg-orange-500 py-2.5 font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
              {saving ? "Saving..." : "Save Product"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

// ---------- Categories ----------
export function Categories() {
  const cats = useFetch("/categories");
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const openForm = (c) => {
    setError("");
    setEditing(c || {});
    setName(c ? c.name : "");
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      editing._id ? await api.put(`/categories/${editing._id}`, { name }) : await api.post("/categories", { name });
      setEditing(null);
      cats.reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (c) => {
    const msg = c.count
      ? `"${c.name}" has ${c.count} products. They will stay in the store but lose this category. Delete anyway?`
      : `Delete category "${c.name}"?`;
    if (!window.confirm(msg)) return;
    await api.del(`/categories/${c._id}`);
    cats.reload();
  };

  if (!cats.data) return <Loading error={cats.error} />;

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Organise your products"
        action={<AddButton onClick={() => openForm()}>Add Category</AddButton>}
      />
      {cats.data.length === 0 && (
        <p className="rounded-xl border bg-white p-8 text-center text-gray-500">No categories yet. Add your first one.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cats.data.map((c) => (
          <div key={c._id} className="flex items-center justify-between rounded-xl border bg-white p-5">
            <div>
              <p className="font-semibold text-gray-900">{c.name}</p>
              <p className="text-sm text-gray-500">{c.count} products</p>
            </div>
            <div className="flex gap-1 text-gray-500">
              <button onClick={() => openForm(c)} className="rounded p-1.5 hover:bg-gray-100 hover:text-orange-600" aria-label="Edit"><Pencil size={16} /></button>
              <button onClick={() => remove(c)} className="rounded p-1.5 hover:bg-gray-100 hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal title={editing._id ? "Rename Category" : "Add Category"} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-3">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <Field label="Category name">
              <input required autoFocus value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </Field>
            <button className="w-full rounded-lg bg-orange-500 py-2.5 font-semibold text-white hover:bg-orange-600">Save</button>
          </form>
        </Modal>
      )}
    </>
  );
}

// ---------- Orders ----------
export function Orders() {
  const orders = useFetch("/orders");
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ customerName: "", phone: "", note: "" });

  const changeStatus = async (o, status) => {
    await api.put(`/orders/${o._id}`, { status });
    orders.reload();
  };

  const openEdit = (o) => {
    setEditing(o);
    setForm({ customerName: o.customerName || "", phone: o.phone || "", note: o.note || "" });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    await api.put(`/orders/${editing._id}`, form);
    setEditing(null);
    orders.reload();
  };

  const remove = async (o) => {
    if (!window.confirm(`Delete order ${orderNo(o)}?`)) return;
    await api.del(`/orders/${o._id}`);
    orders.reload();
  };

  if (!orders.data) return <Loading error={orders.error} />;
  const rows = filter === "All" ? orders.data : orders.data.filter((o) => o.status === filter);

  return (
    <>
      <PageHeader title="Orders" subtitle={`${orders.data.length} orders placed from the website`} />
      <div className="mb-4 flex flex-wrap gap-2">
        {["All", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${filter === s ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-200"}`}
          >
            {s}
          </button>
        ))}
      </div>
      <Table head={["Order", "Customer", "Items", "Amount", "Status", "Actions"]}>
        {rows.length === 0 && <Empty cols={6} text="No orders here yet." />}
        {rows.map((o) => (
          <tr key={o._id} className="hover:bg-gray-50">
            <td className="px-5 py-3 font-semibold text-gray-900">
              {orderNo(o)}
              <div className="text-xs font-normal text-gray-400">
                {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </div>
            </td>
            <td className="px-5 py-3 text-gray-700">
              {o.customerName || <span className="text-gray-400">Not added</span>}
              {o.phone && <div className="text-xs text-gray-400">{o.phone}</div>}
            </td>
            <td className="px-5 py-3 text-gray-600">{o.items.map((i) => `${i.name} x${i.qty}`).join(", ")}</td>
            <td className="px-5 py-3 font-medium">{inr(o.total)}</td>
            <td className="px-5 py-3">
              <select
                value={o.status}
                onChange={(e) => changeStatus(o, e.target.value)}
                className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold outline-none ${STATUS_STYLE[o.status]}`}
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </td>
            <td className="px-5 py-3">
              <div className="flex gap-1 text-gray-500">
                <button onClick={() => openEdit(o)} className="rounded p-1.5 hover:bg-gray-100 hover:text-orange-600" aria-label="Edit"><Pencil size={16} /></button>
                <button onClick={() => remove(o)} className="rounded p-1.5 hover:bg-gray-100 hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {editing && (
        <Modal title={`Edit order ${orderNo(editing)}`} onClose={() => setEditing(null)}>
          <form onSubmit={saveEdit} className="space-y-3">
            <Field label="Customer name">
              <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Note">
              <textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputCls} />
            </Field>
            <button className="w-full rounded-lg bg-orange-500 py-2.5 font-semibold text-white hover:bg-orange-600">Save</button>
          </form>
        </Modal>
      )}
    </>
  );
}

// ---------- Customers (built from orders that have a name or phone) ----------
export function Customers() {
  const orders = useFetch("/orders");
  if (!orders.data) return <Loading error={orders.error} />;

  const map = {};
  orders.data
    .filter((o) => (o.customerName || o.phone) && o.status !== "Cancelled")
    .forEach((o) => {
      const key = o.phone || o.customerName;
      map[key] ||= { name: o.customerName, phone: o.phone, orders: 0, spent: 0 };
      map[key].orders += 1;
      map[key].spent += o.total;
    });
  const customers = Object.values(map).sort((a, b) => b.spent - a.spent);

  return (
    <>
      <PageHeader title="Customers" subtitle={`${customers.length} customers`} />
      <Table head={["Name", "Phone", "Orders", "Total spent"]}>
        {customers.length === 0 && (
          <Empty cols={4} text="No customers yet. Add a name and phone to an order (Orders → edit) and they appear here." />
        )}
        {customers.map((c) => (
          <tr key={c.phone || c.name} className="hover:bg-gray-50">
            <td className="px-5 py-3 font-semibold text-gray-900">{c.name || "—"}</td>
            <td className="px-5 py-3 text-gray-600">{c.phone || "—"}</td>
            <td className="px-5 py-3">{c.orders}</td>
            <td className="px-5 py-3 font-medium">{inr(c.spent)}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}

// ---------- Settings ----------
export function SettingsPage() {
  const settings = useFetch("/settings");
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (settings.data) setForm(settings.data);
  }, [settings.data]);

  if (!form) return <Loading error={settings.error} />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.put("/settings", form);
      setMsg("Saved! The store now uses these details.");
    } catch (err) {
      setMsg(err.message);
    }
  };

  const fields = [
    ["storeName", "Store name"],
    ["whatsapp", "WhatsApp number (country code + number, no + or spaces)"],
    ["email", "Contact email"],
    ["address", "Address"],
  ];

  return (
    <>
      <PageHeader title="Settings" subtitle="Store details shown on your website" />
      <form onSubmit={save} className="max-w-xl space-y-4 rounded-xl border bg-white p-6">
        {fields.map(([key, label]) => (
          <Field key={key} label={label}>
            <input value={form[key] || ""} onChange={set(key)} className={inputCls} />
          </Field>
        ))}
        {msg && <p className="text-sm text-gray-600">{msg}</p>}
        <button className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">
          Save Changes
        </button>
      </form>
    </>
  );
}
