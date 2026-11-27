import crypto from "crypto";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { Product, Category, Order, Setting, Review } from "./models.js";


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
  ...new Set(
    CLIENT_URL.split(",")
      .map((url) => url.trim().replace(/\/$/, ""))
      .filter(Boolean)
  ),
  "http://localhost:5173",
];

app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (e.g. server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    message: "Too many review submissions. Please try again later."
  }
});
const PRODUCT_FIELDS = ["name", "brand", "category", "price", "oldPrice", "stock", "rating", "tag", "image", "images", "description", "isDeal", "dealEndsAt"];

// Pick product fields and tidy the images list (max 8, http(s) urls only).
// The first image is always kept as the cover in `image`.
const productData = (body) => {
  const data = pick(body, PRODUCT_FIELDS);
  if (Array.isArray(data.images)) {
    data.images = data.images
      .map((u) => String(u).trim())
      .filter((u) => /^https?:\/\//.test(u))
      .slice(0, 8);
    data.image = data.images[0] || "";
  }
  if ("isDeal" in data) data.isDeal = Boolean(data.isDeal);
  if ("dealEndsAt" in data) {
    const d = data.dealEndsAt ? new Date(data.dealEndsAt) : null;
    data.dealEndsAt = d && !isNaN(d) ? d : null;
  }
  return data;
};

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
  const { category, q, limit, deal } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (q) {
    // every word must match at least one of name / brand / category / description,
    // so "brake pad" and "pad brake" both work
    const words = String(q).trim().split(/\s+/).filter(Boolean).slice(0, 6);
    filter.$and = words.map((w) => {
      const rx = { $regex: w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
      return { $or: [{ name: rx }, { brand: rx }, { category: rx }, { description: rx }] };
    });
  }
  if (deal) {
    // only deals that are switched on and not expired
    filter.isDeal = true;
    filter.$and = [
      ...(filter.$and || []),
      { $or: [{ dealEndsAt: null }, { dealEndsAt: { $gt: new Date() } }] },
    ];
  }
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
  const p = await Product.create(productData(req.body));
  res.status(201).json(p);
}));

app.put("/api/products/:id", auth, checkId, wrap(async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, productData(req.body), {
    new: true,
    runValidators: true,
  });
  p ? res.json(p) : res.status(404).json({ message: "Product not found" });
}));

app.delete("/api/products/:id", auth, checkId, wrap(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));


// ---------- customer reviews ----------

// GET: Fetch reviews for a product
app.get("/api/reviews/:productId", wrap(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const product = await Product.findById(productId).select("_id");

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const [reviews, stats] = await Promise.all([
    Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),

    Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId)
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ])
  ]);

  res.json({
    reviews,
    averageRating: Number((stats[0]?.averageRating || 0).toFixed(1)),
    totalReviews: stats[0]?.totalReviews || 0
  });
}));

// POST: Submit a customer review
app.post("/api/reviews/:productId", reviewLimiter, wrap(async (req, res) => {
  const { productId } = req.params;
  const { customerName, rating, comment } = req.body;

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const product = await Product.findById(productId).select("_id");

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const name = typeof customerName === "string"
    ? customerName.trim()
    : "";

  const reviewComment = typeof comment === "string"
    ? comment.trim()
    : "";

  const reviewRating = Number(rating);

  if (!name || name.length > 100) {
    return res.status(400).json({
      message: "Name is required and must be under 100 characters"
    });
  }

  if (!Number.isInteger(reviewRating) || reviewRating < 1 || reviewRating > 5) {
    return res.status(400).json({
      message: "Rating must be a whole number between 1 and 5"
    });
  }

  if (reviewComment.length < 3 || reviewComment.length > 1000) {
    return res.status(400).json({
      message: "Review must be between 3 and 1000 characters"
    });
  }

  const review = await Review.create({
    product: productId,
    customerName: name,
    rating: reviewRating,
    comment: reviewComment
  });

  const stats = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId)
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  res.status(201).json({
    message: "Review submitted successfully",
    review,
    averageRating: Number((stats[0]?.averageRating || 0).toFixed(1)),
    totalReviews: stats[0]?.totalReviews || 0
  });
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


// ---------- orders ----------

// PUBLIC: Create an order without deducting stock.
// Stock is deducted only when the admin confirms the order.
app.post("/api/orders", orderLimiter, wrap(async (req, res) => {
  const {
    customerName,
    phone,
    address,
    city,
    state,
    pincode,
    note,
    items,
  } = req.body;

  const clean = (value) =>
    typeof value === "string" ? value.trim() : "";

  const name = clean(customerName);
  const mobile = clean(phone);
  const deliveryAddress = clean(address);
  const deliveryCity = clean(city);
  const deliveryState = clean(state);
  const postalCode = String(pincode || "").trim();
  const orderNote = clean(note);

  // Validate customer details
  if (
    !name ||
    name.length > 100 ||
    !mobile ||
    mobile.length > 20 ||
    !deliveryAddress ||
    deliveryAddress.length > 300 ||
    !deliveryCity ||
    !deliveryState ||
    !/^[0-9]{6}$/.test(postalCode) ||
    orderNote.length > 500
  ) {
    return res.status(400).json({
      message: "Please provide valid customer and delivery details",
    });
  }

  // Validate cart
  if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
    return res.status(400).json({ message: "Invalid items" });
  }

  // Combine duplicate product IDs
  const quantities = new Map();

  for (const item of items) {
    const id = String(item?.productId || "");
    const qty = Number(item?.qty);

    if (
      !mongoose.isValidObjectId(id) ||
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > 100
    ) {
      return res.status(400).json({
        message: "Invalid product or quantity",
      });
    }

    quantities.set(id, (quantities.get(id) || 0) + qty);
  }

  if ([...quantities.values()].some((qty) => qty > 100)) {
    return res.status(400).json({
      message: "Maximum quantity per product is 100",
    });
  }

  // Read product details and calculate prices from the database.
  // This checks current stock but does NOT reserve or deduct it.
  const productIds = [...quantities.keys()];

  const products = await Product.find({
    _id: { $in: productIds },
  }).lean();

  const productMap = new Map(
    products.map((product) => [String(product._id), product])
  );

  const lines = [];
  let total = 0;

  for (const [productId, qty] of quantities) {
    const product = productMap.get(productId);

    if (!product) {
      return res.status(404).json({
        message: "One or more products are unavailable",
      });
    }

    if (product.stock < qty) {
      return res.status(409).json({
        message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
      });
    }

    lines.push({
      product: product._id,
      name: product.name,
      price: product.price,
      qty,
    });

    total += product.price * qty;
  }

  const order = await Order.create({
    items: lines,
    total,
    customerName: name,
    phone: mobile,
    address: deliveryAddress,
    city: deliveryCity,
    state: deliveryState,
    pincode: postalCode,
    note: orderNote,
    status: "New",
    stockDeducted: false,
    stockRestored: false,
    source: "website",
  });

  res.status(201).json({
    message: "Order created successfully. Awaiting admin confirmation.",
    _id: order._id,
    total: order.total,
    status: order.status,
  });
}));

// ADMIN: Get orders
app.get("/api/orders", auth, wrap(async (_req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(500);

  res.json(orders);
}));

// ADMIN: Update order and safely manage stock
app.put("/api/orders/:id", auth, checkId, wrap(async (req, res) => {
  const allowedFields = [
    "customerName",
    "phone",
    "address",
    "city",
    "state",
    "pincode",
    "note",
  ];

  const updates = pick(req.body, allowedFields);
  const requestedStatus = req.body.status;

  // Validate editable fields
  if (
    updates.customerName !== undefined &&
    (typeof updates.customerName !== "string" ||
      !updates.customerName.trim() ||
      updates.customerName.trim().length > 100)
  ) {
    return res.status(400).json({ message: "Invalid customer name" });
  }

  if (
    updates.phone !== undefined &&
    (typeof updates.phone !== "string" ||
      !updates.phone.trim() ||
      updates.phone.trim().length > 20)
  ) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  if (
    updates.address !== undefined &&
    (typeof updates.address !== "string" ||
      !updates.address.trim() ||
      updates.address.trim().length > 300)
  ) {
    return res.status(400).json({ message: "Invalid address" });
  }

  if (
    updates.pincode !== undefined &&
    !/^[0-9]{6}$/.test(String(updates.pincode).trim())
  ) {
    return res.status(400).json({ message: "Invalid pincode" });
  }

  if (
    updates.note !== undefined &&
    (typeof updates.note !== "string" || updates.note.trim().length > 500)
  ) {
    return res.status(400).json({ message: "Invalid order note" });
  }

  if (
    requestedStatus !== undefined &&
    !["New", "Confirmed", "Delivered", "Cancelled"].includes(requestedStatus)
  ) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  const session = await mongoose.startSession();
  let updatedOrder;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id).session(session);

      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      // Apply customer detail updates
      for (const [key, value] of Object.entries(updates)) {
        order[key] = typeof value === "string" ? value.trim() : value;
      }

      const oldStatus = order.status;
      const newStatus = requestedStatus ?? oldStatus;

      if (newStatus !== oldStatus) {
        // New -> Confirmed: deduct stock atomically
        if (oldStatus === "New" && newStatus === "Confirmed") {
          if (order.stockDeducted || order.stockRestored) {
            const error = new Error("Order inventory state is invalid");
            error.statusCode = 409;
            throw error;
          }

          for (const item of order.items) {
            const product = await Product.findOneAndUpdate(
              {
                _id: item.product,
                stock: { $gte: item.qty },
              },
              {
                $inc: { stock: -item.qty },
              },
              {
                new: true,
                session,
              }
            );

            if (!product) {
              const error = new Error(
                `Insufficient stock for ${item.name || "a product"}`
              );
              error.statusCode = 409;
              throw error;
            }
          }

          order.stockDeducted = true;
          order.stockRestored = false;
        }

        // New -> Cancelled: no stock was deducted
        else if (oldStatus === "New" && newStatus === "Cancelled") {
          if (order.stockDeducted) {
            const error = new Error(
              "Inventory was already deducted. Please check this order before cancelling."
            );
            error.statusCode = 409;
            throw error;
          }
        }

        // Confirmed -> Delivered: stock remains deducted
        else if (oldStatus === "Confirmed" && newStatus === "Delivered") {
          if (!order.stockDeducted || order.stockRestored) {
            const error = new Error("Order inventory state is invalid");
            error.statusCode = 409;
            throw error;
          }
        }

        // Confirmed -> Cancelled: restore stock exactly once
        else if (oldStatus === "Confirmed" && newStatus === "Cancelled") {
          if (!order.stockDeducted || order.stockRestored) {
            const error = new Error(
              "Stock cannot be restored because its inventory state is invalid"
            );
            error.statusCode = 409;
            throw error;
          }

          for (const item of order.items) {
            const result = await Product.updateOne(
              { _id: item.product },
              { $inc: { stock: item.qty } },
              { session }
            );

            if (result.matchedCount !== 1) {
              const error = new Error(
                `Product not found while restoring stock: ${item.name}`
              );
              error.statusCode = 409;
              throw error;
            }
          }

          order.stockRestored = true;
        }

        // Disallow reopening or unsupported status transitions
        else {
          const error = new Error(
            `Cannot change order status from ${oldStatus} to ${newStatus}`
          );
          error.statusCode = 409;
          throw error;
        }

        order.status = newStatus;
      }

      await order.save({ session });
      updatedOrder = order;
    });

    res.json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    throw error;
  } finally {
    await session.endSession();
  }
}));

// ADMIN: Delete only New or safely Cancelled orders.
// Confirmed and Delivered orders must remain in the order history.
app.delete("/api/orders/:id", auth, checkId, wrap(async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id).session(session);

      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      if (order.status === "Confirmed" || order.status === "Delivered") {
        const error = new Error(
          "Confirmed or delivered orders cannot be deleted. Cancel the order first if appropriate."
        );
        error.statusCode = 409;
        throw error;
      }

      if (order.stockDeducted && !order.stockRestored) {
        const error = new Error(
          "This order has deducted stock. Restore inventory before deleting it."
        );
        error.statusCode = 409;
        throw error;
      }

      await Order.deleteOne(
        { _id: order._id },
        { session }
      );
    });

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    throw error;
  } finally {
    await session.endSession();
  }
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
     { $match: { status: { $in: ["Confirmed", "Delivered"] } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", sold: { $sum: "$items.qty" } } },
      { $sort: { sold: -1 } },
      { $limit: 4 },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  const thisWeek = last14.filter((o) => o.createdAt >= weekStart);
  const prevWeek = last14.filter((o) => o.createdAt < weekStart);
  const revenue = (list) =>list.filter((o) => ["Confirmed", "Delivered"].includes(o.status)).reduce((sum, order) => sum + order.total, 0);

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