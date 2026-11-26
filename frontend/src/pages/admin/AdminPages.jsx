
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Cog,
  ImagePlus,
  MessageCircle,
} from "lucide-react";
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
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

// ---------- Shared Components ----------

function useFetch(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const reload = useCallback(() => {
    setError("");

    api.get(path)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [path]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, reload, setData };
}

function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function AddButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
    >
      <Plus size={16} />
      {children}
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
              <th key={h} className="px-5 py-3">
                {h}
              </th>
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
      <td
        colSpan={cols}
        className="px-5 py-10 text-center text-gray-500"
      >
        {text}
      </td>
    </tr>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100"
            aria-label="Close"
          >
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
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function Loading({ error }) {
  return error ? (
    <p className="rounded-lg bg-red-50 p-4 text-red-700">
      {error}
    </p>
  ) : (
    <p className="text-gray-500">Loading...</p>
  );
}

// ======================================================
// PRODUCTS
// ======================================================

const EMPTY_PRODUCT = {
  name: "",
  brand: "",
  category: "",
  price: "",
  oldPrice: "",
  stock: "",
  rating: "4",
  tag: "",
  image: "",
  description: "",
};

export function Products() {
  const products = useFetch("/products");
  const categories = useFetch("/categories");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  // Open add/edit modal
  const openForm = (product) => {
    setError("");
    setEditing(product || {});

    setForm(
      product
        ? { ...EMPTY_PRODUCT, ...product }
        : { ...EMPTY_PRODUCT }
    );
  };

  // Update form fields
  const set = (key) => (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Upload image to Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

    // Allow selecting the same file again
    e.target.value = "";

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    const cloudName =
      import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError(
        "Cloudinary configuration is missing. Check your frontend .env file."
      );
      return;
    }

    setError("");
    setUploading(true);

    try {
      const data = new FormData();

      data.append("file", file);
      data.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error?.message || "Image upload failed."
        );
      }

      if (!result.secure_url) {
        throw new Error("Cloudinary did not return an image URL.");
      }

      setForm((prev) => ({
        ...prev,
        image: result.secure_url,
      }));
    } catch (err) {
      setError(err.message || "Unable to upload image.");
    } finally {
      setUploading(false);
    }
  };

  // Save product
  const save = async (e) => {
    e.preventDefault();
    setError("");

    if (uploading) {
      setError("Please wait until the image upload finishes.");
      return;
    }

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError("Please enter a valid product price.");
      return;
    }

    if (Number(form.stock) < 0 || Number(form.oldPrice) < 0) {
      setError("Price, old price, and stock cannot be negative.");
      return;
    }

    if (
      form.rating !== "" &&
      (Number(form.rating) < 0 || Number(form.rating) > 5)
    ) {
      setError("Rating must be between 0 and 5.");
      return;
    }

    setSaving(true);

    const body = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      price: Number(form.price),
      oldPrice: Number(form.oldPrice) || 0,
      stock: Number(form.stock) || 0,
      rating: Number(form.rating) || 0,
      tag: form.tag.trim(),
      image: form.image,
      description: form.description.trim(),
    };

    try {
      if (editing?._id) {
        await api.put(`/products/${editing._id}`, body);
      } else {
        await api.post("/products", body);
      }

      setEditing(null);
      setForm({ ...EMPTY_PRODUCT });
      products.reload();
    } catch (err) {
      setError(err.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const remove = async (product) => {
    if (
      !window.confirm(
        `Delete "${product.name}"? It will disappear from the store.`
      )
    ) {
      return;
    }

    try {
      await api.del(`/products/${product._id}`);
      products.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!products.data) {
    return <Loading error={products.error} />;
  }

  const rows = products.data.filter((product) =>
    product.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${products.data.length} products in your store`}
        action={
          <AddButton onClick={() => openForm()}>
            Add Product
          </AddButton>
        }
      />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className={`${inputCls} mb-4 max-w-xs bg-white`}
      />

      <Table
        head={[
          "Product",
          "Category",
          "Price",
          "Stock",
          "Actions",
        ]}
      >
        {rows.length === 0 && (
          <Empty
            cols={5}
            text="No products found. Click Add Product to create one."
          />
        )}

        {rows.map((p) => (
          <tr key={p._id} className="hover:bg-gray-50">
            <td className="px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Cog
                      size={18}
                      className="text-gray-300"
                    />
                  )}
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    {p.name}
                  </p>

                  {p.brand && (
                    <p className="text-xs text-gray-400">
                      {p.brand}
                    </p>
                  )}
                </div>
              </div>
            </td>

            <td className="px-5 py-3 text-gray-600">
              {p.category || "—"}
            </td>

            <td className="px-5 py-3 font-medium">
              {inr(p.price)}
            </td>

            <td className="px-5 py-3">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  p.stock <= 5
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {p.stock} in stock
              </span>
            </td>

            <td className="px-5 py-3">
              <div className="flex gap-1 text-gray-500">
                <button
                  type="button"
                  onClick={() => openForm(p)}
                  className="rounded p-1.5 hover:bg-gray-100 hover:text-orange-600"
                  aria-label="Edit product"
                >
                  <Pencil size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => remove(p)}
                  className="rounded p-1.5 hover:bg-gray-100 hover:text-red-600"
                  aria-label="Delete product"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* Add/Edit Product Modal */}
      {editing && (
        <Modal
          title={editing._id ? "Edit Product" : "Add Product"}
          onClose={() => {
            if (!saving && !uploading) {
              setEditing(null);
            }
          }}
        >
          <form onSubmit={save} className="space-y-3">
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <Field label="Product name *">
              <input
                required
                maxLength={150}
                value={form.name}
                onChange={set("name")}
                placeholder="Enter product name"
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Brand">
                <input
                  value={form.brand}
                  onChange={set("brand")}
                  placeholder="Brand name"
                  className={inputCls}
                />
              </Field>

              <Field label="Category">
                <select
                  value={form.category}
                  onChange={set("category")}
                  className={inputCls}
                >
                  <option value="">— none —</option>

                  {(categories.data || []).map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Price (₹) *">
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={set("price")}
                  placeholder="0"
                  className={inputCls}
                />
              </Field>

              <Field label="Old price (₹)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.oldPrice}
                  onChange={set("oldPrice")}
                  placeholder="0"
                  className={inputCls}
                />
              </Field>

              <Field label="Stock">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={set("stock")}
                  placeholder="0"
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Rating (0–5)">
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={set("rating")}
                  className={inputCls}
                />
              </Field>

              <Field label="Tag">
                <input
                  value={form.tag}
                  onChange={set("tag")}
                  placeholder="New, Best Seller"
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Cloudinary Image Upload */}
            <Field label="Product Image">
              <div className="rounded-xl border-2 border-dashed border-gray-300 p-4">
                {form.image ? (
                  <div className="mb-4">
                    <img
                      src={form.image}
                      alt="Product preview"
                      className="h-44 w-full rounded-lg bg-gray-100 object-contain"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          image: "",
                        }))
                      }
                      className="mt-2 text-sm font-medium text-red-600 hover:underline"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-5 text-gray-400">
                    <ImagePlus size={38} />
                    <p className="mt-2 text-sm">
                      Select a product image
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading || saving}
                  className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:font-semibold file:text-orange-600 hover:file:bg-orange-100 disabled:opacity-50"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Supported: JPG, PNG, WEBP. Maximum size: 5 MB.
                </p>

                {uploading && (
                  <div className="mt-3 rounded-lg bg-orange-50 p-3">
                    <p className="text-sm font-semibold text-orange-600">
                      Uploading image to Cloudinary...
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-orange-100">
                      <div className="h-full w-1/2 animate-pulse rounded-full bg-orange-500" />
                    </div>
                  </div>
                )}
              </div>
            </Field>

            <Field label="Description">
              <textarea
                rows={3}
                maxLength={2000}
                value={form.description}
                onChange={set("description")}
                placeholder="Enter product description..."
                className={inputCls}
              />
            </Field>

            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full rounded-lg bg-orange-500 py-2.5 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading
                ? "Uploading Image..."
                : saving
                ? "Saving Product..."
                : "Save Product"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

// ======================================================
// CATEGORIES
// ======================================================

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
      if (editing._id) {
        await api.put(`/categories/${editing._id}`, { name });
      } else {
        await api.post("/categories", { name });
      }

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

    try {
      await api.del(`/categories/${c._id}`);
      cats.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!cats.data) {
    return <Loading error={cats.error} />;
  }

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Organise your products"
        action={
          <AddButton onClick={() => openForm()}>
            Add Category
          </AddButton>
        }
      />

      {cats.data.length === 0 && (
        <p className="rounded-xl border bg-white p-8 text-center text-gray-500">
          No categories yet. Add your first one.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cats.data.map((c) => (
          <div
            key={c._id}
            className="flex items-center justify-between rounded-xl border bg-white p-5"
          >
            <div>
              <p className="font-semibold text-gray-900">
                {c.name}
              </p>
              <p className="text-sm text-gray-500">
                {c.count || 0} products
              </p>
            </div>

            <div className="flex gap-1 text-gray-500">
              <button
                type="button"
                onClick={() => openForm(c)}
                className="rounded p-1.5 hover:bg-gray-100 hover:text-orange-600"
                aria-label="Edit category"
              >
                <Pencil size={16} />
              </button>

              <button
                type="button"
                onClick={() => remove(c)}
                className="rounded p-1.5 hover:bg-gray-100 hover:text-red-600"
                aria-label="Delete category"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Modal
          title={editing._id ? "Rename Category" : "Add Category"}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save} className="space-y-3">
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <Field label="Category name">
              <input
                required
                autoFocus
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
              />
            </Field>

            <button className="w-full rounded-lg bg-orange-500 py-2.5 font-semibold text-white hover:bg-orange-600">
              Save
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

// ======================================================
// ORDERS
// ======================================================


export function Orders() {
  const orders = useFetch("/orders");

  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    note: "",
  });

  const set = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  // Update order status
  const changeStatus = async (order, status) => {
    try {
      await api.put(`/orders/${order._id}`, { status });
      orders.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  // Open order edit modal
  const openEdit = (order) => {
    setError("");
    setEditing(order);

    setForm({
      customerName: order.customerName || "",
      phone: order.phone || "",
      address: order.address || "",
      city: order.city || "",
      state: order.state || "",
      pincode: order.pincode || "",
      note: order.note || "",
    });
  };

  // Save customer details
  const saveEdit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await api.put(`/orders/${editing._id}`, form);
      setEditing(null);
      orders.reload();
    } catch (err) {
      setError(err.message || "Unable to update order.");
    } finally {
      setSaving(false);
    }
  };

  // Delete order
  const remove = async (order) => {
    if (!window.confirm(`Delete order ${orderNo(order)}?`)) {
      return;
    }

    try {
      await api.del(`/orders/${order._id}`);
      orders.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  // Open WhatsApp with order information
  const contactCustomer = (order) => {
    const phone = String(order.phone || "").replace(/\D/g, "");

    if (!phone) {
      alert("Customer phone number is not available.");
      return;
    }

    const message = `
Hello ${order.customerName || "Customer"},

This is EVA Auto Parts.

Regarding your order ${orderNo(order)}:

Products:
${(order.items || [])
  .map((item, index) =>
    `${index + 1}. ${item.name} x ${item.qty}`
  )
  .join("\n")}

Order Total: ${inr(order.total)}
Order Status: ${order.status}

Thank you for shopping with EVA Auto Parts.
    `.trim();

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!orders.data) {
    return <Loading error={orders.error} />;
  }

  const rows =
    filter === "All"
      ? orders.data
      : orders.data.filter((order) => order.status === filter);

  return (
    <>
      <PageHeader
        title="Orders Management"
        subtitle={`${orders.data.length} total orders received`}
      />

      {/* Order Summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Total Orders",
            value: orders.data.length,
            color: "bg-blue-50 text-blue-700",
          },
          {
            label: "New Orders",
            value: orders.data.filter((o) => o.status === "New").length,
            color: "bg-yellow-50 text-yellow-700",
          },
          {
            label: "Confirmed",
            value: orders.data.filter((o) => o.status === "Confirmed").length,
            color: "bg-green-50 text-green-700",
          },
          {
            label: "Delivered",
            value: orders.data.filter((o) => o.status === "Delivered").length,
            color: "bg-purple-50 text-purple-700",
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-xl p-4 ${item.color}`}
          >
            <p className="text-sm font-medium">{item.label}</p>
            <p className="mt-2 text-2xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Status Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        {["All", ...STATUSES].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === status
                ? "bg-orange-500 text-white"
                : "border bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <Table
        head={[
          "Order",
          "Customer",
          "Products",
          "Amount",
          "Status",
          "Actions",
        ]}
      >
        {rows.length === 0 && (
          <Empty cols={6} text="No orders found." />
        )}

        {rows.map((order) => (
          <tr key={order._id} className="align-top hover:bg-gray-50">
            {/* Order ID */}
            <td className="px-5 py-4">
              <p className="font-bold text-gray-900">
                {orderNo(order)}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </td>

            {/* Customer */}
            <td className="px-5 py-4">
              <p className="font-semibold text-gray-900">
                {order.customerName || "Not provided"}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {order.phone || "No phone"}
              </p>

              <p className="mt-2 max-w-[220px] text-xs text-gray-500">
                {[
                  order.address,
                  order.city,
                  order.state,
                  order.pincode,
                ]
                  .filter(Boolean)
                  .join(", ") || "Address unavailable"}
              </p>
            </td>

            {/* Products */}
            <td className="px-5 py-4">
              <div className="space-y-1">
                {(order.items || []).map((item, index) => (
                  <p
                    key={item.product || index}
                    className="text-xs text-gray-600"
                  >
                    {item.name} × {item.qty}
                  </p>
                ))}
              </div>
            </td>

            {/* Total */}
            <td className="px-5 py-4 font-bold text-gray-900">
              {inr(order.total)}
            </td>

            {/* Status */}
            <td className="px-5 py-4">
              <select
                value={order.status || "New"}
                onChange={(e) =>
                  changeStatus(order, e.target.value)
                }
                className={`rounded-full border-0 px-3 py-2 text-xs font-semibold outline-none ${
                  STATUS_STYLE[order.status] || STATUS_STYLE.New
                }`}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </td>

            {/* Actions */}
            <td className="px-5 py-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => contactCustomer(order)}
                  disabled={!order.phone}
                  title="Contact customer on WhatsApp"
                  className="rounded-lg bg-green-50 p-2 text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <MessageCircleIcon />
                </button>

                <button
                  type="button"
                  onClick={() => openEdit(order)}
                  title="Edit order"
                  className="rounded-lg bg-orange-50 p-2 text-orange-600 hover:bg-orange-100"
                >
                  <Pencil size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => remove(order)}
                  title="Delete order"
                  className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* Edit Order Modal */}
      {editing && (
        <Modal
          title={`Edit Order ${orderNo(editing)}`}
          onClose={() => {
            if (!saving) setEditing(null);
          }}
        >
          <form onSubmit={saveEdit} className="space-y-4">
            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <Field label="Customer Name">
              <input
                value={form.customerName}
                onChange={set("customerName")}
                className={inputCls}
              />
            </Field>

            <Field label="Mobile Number">
              <input
                value={form.phone}
                onChange={set("phone")}
                className={inputCls}
              />
            </Field>

            <Field label="Delivery Address">
              <textarea
                rows={2}
                value={form.address}
                onChange={set("address")}
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="City">
                <input
                  value={form.city}
                  onChange={set("city")}
                  className={inputCls}
                />
              </Field>

              <Field label="State">
                <input
                  value={form.state}
                  onChange={set("state")}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="PIN Code">
              <input
                value={form.pincode}
                onChange={set("pincode")}
                maxLength={6}
                className={inputCls}
              />
            </Field>

            <Field label="Order Note">
              <textarea
                rows={3}
                value={form.note}
                onChange={set("note")}
                className={inputCls}
              />
            </Field>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? "Updating..." : "Update Order"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

// WhatsApp icon helper
function MessageCircleIcon() {
  return <MessageCircle size={16} />;
}


// ======================================================
// CUSTOMERS
// ======================================================

export function Customers() {
  const orders = useFetch("/orders");

  if (!orders.data) {
    return <Loading error={orders.error} />;
  }

  const map = {};

  orders.data
    .filter(
      (o) =>
        (o.customerName || o.phone) &&
        o.status !== "Cancelled"
    )
    .forEach((o) => {
      const key = o.phone || o.customerName;

      map[key] ||= {
        name: o.customerName,
        phone: o.phone,
        orders: 0,
        spent: 0,
      };

      map[key].orders += 1;
      map[key].spent += o.total || 0;
    });

  const customers = Object.values(map).sort(
    (a, b) => b.spent - a.spent
  );

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} customers`}
      />

      <Table
        head={["Name", "Phone", "Orders", "Total spent"]}
      >
        {customers.length === 0 && (
          <Empty cols={4} text="No customers yet." />
        )}

        {customers.map((c) => (
          <tr
            key={c.phone || c.name}
            className="hover:bg-gray-50"
          >
            <td className="px-5 py-3 font-semibold text-gray-900">
              {c.name || "—"}
            </td>

            <td className="px-5 py-3 text-gray-600">
              {c.phone || "—"}
            </td>

            <td className="px-5 py-3">{c.orders}</td>

            <td className="px-5 py-3 font-medium">
              {inr(c.spent)}
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}

// ======================================================
// SETTINGS
// ======================================================

export function SettingsPage() {
  const settings = useFetch("/settings");

  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings.data) {
      setForm(settings.data);
    }
  }, [settings.data]);

  if (!form) {
    return <Loading error={settings.error} />;
  }

  const set = (key) => (e) =>
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));

  const save = async (e) => {
    e.preventDefault();
    setMsg("");
    setSaving(true);

    try {
      await api.put("/settings", form);
      setMsg("Saved! The store now uses these details.");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    ["storeName", "Store name"],
    [
      "whatsapp",
      "WhatsApp number (country code + number, no + or spaces)",
    ],
    ["email", "Contact email"],
    ["address", "Address"],
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Store details shown on your website"
      />

      <form
        onSubmit={save}
        className="max-w-xl space-y-4 rounded-xl border bg-white p-6"
      >
        {fields.map(([key, label]) => (
          <Field key={key} label={label}>
            <input
              value={form[key] || ""}
              onChange={set(key)}
              className={inputCls}
            />
          </Field>
        ))}

        {msg && (
          <p className="text-sm text-gray-600">{msg}</p>
        )}

        <button
          disabled={saving}
          className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </>
  );
}
