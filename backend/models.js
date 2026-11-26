import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Product Schema
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    brand: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0, default: 0 },
    stock: { type: Number, min: 0, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 4 },
    tag: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" }, // cover (= images[0])
    images: { type: [String], default: [] },
    isDeal: { type: Boolean, default: false }, // shown in the Deals section
    dealEndsAt: { type: Date, default: null }, // null = no end date
    description: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// Category Schema
const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 80,
    },
  },
  { timestamps: true }
);

// Order Schema
const orderSchema = new Schema(
  {
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        price: Number,
        qty: { type: Number, default: 1 },
      },
    ],

    total: {
      type: Number,
      default: 0,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 6,
    },

    note: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    status: {
  type: String,
  enum: ["New", "Confirmed", "Delivered", "Cancelled"],
  default: "New",
},

stockDeducted: {
  type: Boolean,
  default: false,
},

stockRestored: {
  type: Boolean,
  default: false,
},

source: {
  type: String,
  default: "website",
},
  },
  { timestamps: true }
);

// Settings Schema
const settingSchema = new Schema({
  key: { type: String, default: "main", unique: true },
  storeName: { type: String, default: "AutoParts Hub" },
  whatsapp: { type: String, default: "919999999999" },
  email: { type: String, default: "" },
  address: { type: String, default: "" },
});
// Review Schema
const reviewSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);
export const Review = model("Review", reviewSchema);
export const Product = model("Product", productSchema);
export const Category = model("Category", categorySchema);
export const Order = model("Order", orderSchema);
export const Setting = model("Setting", settingSchema);