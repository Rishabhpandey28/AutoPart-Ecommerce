import "dotenv/config";
import crypto from "crypto";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { Product, Category, Order, Setting } from "./models.js";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);


const {
  MONGO_URI,
  JWT_SECRET,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  CLIENT_URL = "http://localhost:5173",
  PORT = 5000,
} = process.env;

const app = express();
if (!MONGO_URI || !JWT_SECRET || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Missing env vars. Copy .env.example to .env and fill it in.");
  process.exit(1);
}
const allowedOrigins = [
  "https://autopart-ecommerce.onrender.com",
  "http://localhost:5173"
];

app.set("trust proxy", 1); // neede d for correct IPs behind Render/Railway/etc.
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "1mb" }));

// ---------- helpers ----------
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const pick = (obj, keys) =>
  Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

const sha = (s) => crypto.createHash("sha256").update(String(s)).digest();
const safeEqual = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));

const checkId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ message: "Invalid id" });

const auth = (req, res, next) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Please log in again" });
  }
};

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { message: "Too many attempts, try later" } });
const orderLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, message: { message: "Too many orders, try later" } });

const PRODUCT_FIELDS = ["name", "brand", "category", "price", "oldPrice", "stock", "rating", "tag", "image", "description"];

// ---------- auth ----------
app.post("/api/auth/login", loginLimiter, (req, res) => {
  const { email = "", password = "" } = req.body;
  if (safeEqual(email.toLowerCase(), ADMIN_EMAIL.toLowerCase()) && safeEqual(password, ADMIN_PASSWORD)) {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token });
  }
  res.status(401).json({ message: "Wrong email or password" });
});

// ---------- products ----------
app.get("/api/products", wrap(async (req, res) => {
  const { category, q, limit } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (q) filter.name = { $regex: String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  const products = await Product.find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(parseInt(limit) || 200, 200));
  res.json(products);
}));

app.get("/api/products/:id", checkId, wrap(async (req, res) => {
  const p = await Product.findById(req.params.id);
  p ? res.json(p) : res.status(404).json({ message: "Product not found" });
}));

app.post("/api/products", auth, wrap(async (req, res) => {
  const p = await Product.create(pick(req.body, PRODUCT_FIELDS));
  res.status(201).json(p);
}));

app.put("/api/products/:id", auth, checkId, wrap(async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, pick(req.body, PRODUCT_FIELDS), {
    new: true,
    runValidators: true,
  });
  p ? res.json(p) : res.status(404).json({ message: "Product not found" });
}));

app.delete("/api/products/:id", auth, checkId, wrap(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

// ---------- categories ----------
app.get("/api/categories", wrap(async (_req, res) => {
  const [cats, counts] = await Promise.all([
    Category.find().sort({ name: 1 }).lean(),
    Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
  ]);
  const map = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  res.json(cats.map((c) => ({ ...c, count: map[c.name] || 0 })));
}));

app.post("/api/categories", auth, wrap(async (req, res) => {
  const c = await Category.create({ name: req.body.name });
  res.status(201).json(c);
}));

app.put("/api/categories/:id", auth, checkId, wrap(async (req, res) => {
  const old = await Category.findById(req.params.id);
  if (!old) return res.status(404).json({ message: "Category not found" });
  const oldName = old.name;
  old.name = req.body.name;
  await old.save();
  if (oldName !== old.name) await Product.updateMany({ category: oldName }, { category: old.name });
  res.json(old);
}));

app.delete("/api/categories/:id", auth, checkId, wrap(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

// ---------- orders ----------
// Public: called when a customer taps "Order on WhatsApp". Prices come from the DB, not the browser.
app.post("/api/orders", orderLimiter, wrap(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0 || items.length > 20)
    return res.status(400).json({ message: "Invalid items" });

  const ids = items.map((i) => i.productId).filter((id) => mongoose.isValidObjectId(id));
  const products = await Product.find({ _id: { $in: ids } });

  const lines = [];
  for (const i of items) {
    const p = products.find((x) => String(x._id) === String(i.productId));
    if (!p) continue;
    const qty = Math.min(Math.max(parseInt(i.qty) || 1, 1), 100);
    lines.push({ product: p._id, name: p.name, price: p.price, qty });
  }
  if (lines.length === 0) return res.status(400).json({ message: "Products not found" });

  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const order = await Order.create({ items: lines, total });
  res.status(201).json({ _id: order._id, total });
}));

app.get("/api/orders", auth, wrap(async (_req, res) => {
  res.json(await Order.find().sort({ createdAt: -1 }).limit(500));
}));

app.put("/api/orders/:id", auth, checkId, wrap(async (req, res) => {
  const o = await Order.findByIdAndUpdate(
    req.params.id,
    pick(req.body, ["status", "customerName", "phone", "note"]),
    { new: true, runValidators: true }
  );
  o ? res.json(o) : res.status(404).json({ message: "Order not found" });
}));

app.delete("/api/orders/:id", auth, checkId, wrap(async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

// ---------- dashboard stats ----------
const pct = (cur, prev) => (prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 1000) / 10);

app.get("/api/stats", auth, wrap(async (_req, res) => {
  const day = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const now = new Date();
  const weekStart = day(new Date(now - 6 * 864e5));
  const prevStart = day(new Date(now - 13 * 864e5));

  const [last14, productCount, allOrders, phones, lowStock, topProducts, recentOrders] = await Promise.all([
    Order.find({ createdAt: { $gte: prevStart } }).lean(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.distinct("phone"),
    Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(5).select("name stock").lean(),
    Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", sold: { $sum: "$items.qty" } } },
      { $sort: { sold: -1 } },
      { $limit: 4 },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  const thisWeek = last14.filter((o) => o.createdAt >= weekStart);
  const prevWeek = last14.filter((o) => o.createdAt < weekStart);
  const revenue = (list) => list.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);

  const ordersByDay = [];
  for (let i = 6; i >= 0; i--) {
    const start = day(new Date(now - i * 864e5));
    const end = new Date(start.getTime() + 864e5);
    ordersByDay.push({
      day: start.toLocaleDateString("en-US", { weekday: "short" }),
      orders: thisWeek.filter((o) => o.createdAt >= start && o.createdAt < end).length,
    });
  }

  res.json({
    totals: {
      orders: thisWeek.length,
      ordersChange: pct(thisWeek.length, prevWeek.length),
      revenue: revenue(thisWeek),
      revenueChange: pct(revenue(thisWeek), revenue(prevWeek)),
      products: productCount,
      customers: phones.filter(Boolean).length,
      allOrders,
    },
    ordersByDay,
    recentOrders,
    topProducts: topProducts.map((t) => ({ name: t._id, sold: t.sold })),
    lowStock,
  });
}));

// ---------- settings ----------
app.get("/api/settings", wrap(async (_req, res) => {
  const s = (await Setting.findOne({ key: "main" })) || (await Setting.create({ key: "main" }));
  res.json(s);
}));

app.put("/api/settings", auth, wrap(async (req, res) => {
  const s = await Setting.findOneAndUpdate(
    { key: "main" },
    pick(req.body, ["storeName", "whatsapp", "email", "address"]),
    { new: true, upsert: true }
  );
  res.json(s);
}));

// ---------- errors ----------
app.use((_req, res) => res.status(404).json({ message: "Not found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === "ValidationError") return res.status(400).json({ message: Object.values(err.errors)[0].message });
  if (err.code === 11000) return res.status(400).json({ message: "That name already exists" });
  res.status(500).json({ message: "Something went wrong" });
});

// ---------- start ----------
mongoose
  .connect(MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((e) => {
    console.error("MongoDB connection failed:", e.message);
    process.exit(1);
  });
