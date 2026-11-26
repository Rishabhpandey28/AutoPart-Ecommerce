
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";

export default function Checkout() {
  const navigate = useNavigate();

  const { cartItems, cartTotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    note: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      return "Please enter your full name.";
    }

    const phone = formData.phone.replace(/[\s()-]/g, "");

    if (!/^\+?[0-9]{10,13}$/.test(phone)) {
      return "Please enter a valid mobile number.";
    }

    if (!formData.address.trim()) {
      return "Please enter your delivery address.";
    }

    if (!formData.city.trim()) {
      return "Please enter your city.";
    }

    if (!formData.state.trim()) {
      return "Please enter your state.";
    }

    if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
      return "Please enter a valid 6-digit PIN code.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        phone: formData.phone.replace(/[\s()-]/g, ""),
        items: cartItems.map((item) => ({
          productId: item._id,
          qty: item.quantity,
        })),
      };

const result = await api.post("/orders", payload);

if (!result?._id) {
  throw new Error("Order was not confirmed by the server.");
}

navigate(`/order-success/${result._id}`, {
  state: {
    orderId: result._id,
    total: result.total,
    customerName: formData.customerName,
    phone: formData.phone,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    pincode: formData.pincode,
    items: cartItems.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  },
});

clearCart();
    } catch (err) {
      setError(
        err.message || "Unable to place your order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <ShoppingBag size={55} className="text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mt-2">
          Add some products before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-7"
        >
          <ArrowLeft size={18} />
          Back to Cart
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Checkout
          </h1>
          <p className="text-gray-500 mt-2">
            Enter your details to place your order.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Customer Details */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-7">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                  <Truck size={23} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Delivery Information
                  </h2>
                  <p className="text-sm text-gray-500">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    maxLength={100}
                    autoComplete="name"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your mobile number"
                    maxLength={16}
                    autoComplete="tel"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">
                    Full Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House number, street, area, landmark"
                    rows={3}
                    maxLength={300}
                    autoComplete="street-address"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    autoComplete="address-level2"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    autoComplete="address-level1"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit PIN code"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">
                    Order Note (Optional)
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Any special delivery instructions?"
                    rows={3}
                    maxLength={500}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                  />
                </div>

              </div>

              {error && (
                <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-7 w-full rounded-lg bg-blue-600 px-6 py-4 font-bold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Your order details will be submitted securely.
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 max-h-80 overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3"
                  >
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="font-semibold text-sm whitespace-nowrap">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-6 pt-5 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>To be confirmed</span>
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold">
                  <span>Product Total</span>
                  <span className="text-blue-600">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-5">
                Delivery charges and final order details can be confirmed by the store.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
