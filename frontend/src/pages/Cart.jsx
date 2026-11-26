
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartTotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-orange-500">
            <ShoppingCart size={36} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Your cart is empty
          </h1>

          <p className="mt-2 text-gray-500">
            You haven't added any products to your cart yet.
          </p>

          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Shopping Cart
          </h1>
          <p className="mt-1 text-gray-500">
            Review your products before checkout.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          {/* Cart products */}
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center"
              >
                {/* Product image */}
                <div className="h-28 w-full overflow-hidden rounded-lg bg-gray-100 sm:w-28 sm:flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <ShoppingBag size={36} />
                    </div>
                  )}
                </div>

                {/* Product details */}
                <div className="flex flex-1 flex-col justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {item.name}
                    </h2>

                    {item.brand && (
                      <p className="mt-1 text-sm text-gray-500">
                        {item.brand}
                      </p>
                    )}

                    <p className="mt-2 font-bold text-orange-600">
                      ₹{Number(item.price).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Quantity controls */}
                    <div className="flex items-center rounded-lg border">
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="min-w-10 text-center font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                        className="p-2 text-gray-600 hover:bg-gray-100"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Remove product */}
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>

                {/* Item total */}
                <div className="text-right sm:min-w-28">
                  <p className="text-xs text-gray-500">Item total</p>
                  <p className="text-lg font-bold text-gray-900">
                    ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 font-semibold text-orange-600 hover:text-orange-700"
            >
              <ArrowRight size={18} className="rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <aside className="h-fit rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Products</span>
                <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>
                  ₹{Number(cartTotal).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="text-sm">Calculated later</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>
                    ₹{Number(cartTotal).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </button>

            <p className="mt-4 text-center text-xs text-gray-500">
              Your order total will be verified before confirmation.
            </p>
          </aside>

        </div>
      </div>
    </main>
  );
}
