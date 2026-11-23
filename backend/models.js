import mongoose from "mongoose";
const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    brand: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0, default: 0 }, // 0 = no discount
    stock: { type: Number, min: 0, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 4 },
    tag: { type: String, trim: true, default: "" }, // e.g. "Best Seller", "New"
    image: { type: String, trim: true, default: "" }, // image URL
    description: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const categorySchema = new Schema(
  { name: { type: String, required: true, unique: true, trim: true, maxlength: 80 } },
  { timestamps: true }
);

const orderSchema = new Schema(
  {
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        qty: { type: Number, default: 1 },
      },
    ],
    total: { type: Number, default: 0 },
    customerName: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    note: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["New", "Confirmed", "Delivered", "Cancelled"], default: "New" },
    source: { type: String, default: "website" },
  },
  { timestamps: true }
);

const settingSchema = new Schema({
  key: { type: String, default: "main", unique: true },
  storeName: { type: String, default: "AutoParts Hub" },
  whatsapp: { type: String, default: "919999999999" },
  email: { type: String, default: "" },
  address: { type: String, default: "" },
});

export const Product = model("Product", productSchema);
export const Category = model("Category", categorySchema);
export const Order = model("Order", orderSchema);
export const Setting = model("Setting", settingSchema);
