
import { Link, useLocation, useParams } from "react-router-dom";
import {
  CheckCircle,
  MessageCircle,
  ShoppingBag,
  Home,
  Copy,
} from "lucide-react";

const WHATSAPP_NUMBER = "9111518187"; // Replace with owner's WhatsApp number

export default function OrderSuccess() {
  const { id } = useParams();
  const location = useLocation();

  const order = location.state || {};
  const orderId = order.orderId || id;

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN");

  const whatsappMessage = `
Hello EVA Auto Parts,

I have placed an order through your website.

Order ID: ${orderId}
Customer Name: ${order.customerName || "Not provided"}
Mobile Number: ${order.phone || "Not provided"}

Delivery Address:
${order.address || "Please refer to my checkout details"}
${order.city || ""}, ${order.state || ""}
PIN Code: ${order.pincode || ""}

Order Items:
${
  order.items?.length
    ? order.items
        .map(
          (item, index) =>
            `${index + 1}. ${item.name} - Qty: ${item.quantity} - ₹${formatPrice(item.price * item.quantity)}`
        )
        .join("\n")
    : "Please check Order ID for product details."
}

Product Total: ₹${formatPrice(order.total)}

Please confirm my order.

Thank you.
  `.trim();

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      alert("Order ID copied!");
    } catch {
      alert("Unable to copy Order ID.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-10 text-center">

        <div className="flex justify-center mb-5">
          <div className="bg-green-100 rounded-full p-5">
            <CheckCircle
              size={58}
              className="text-green-600"
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          Order Placed Successfully!
        </h1>

        <p className="text-gray-500 mt-3">
          Thank you for shopping with EVA Auto Parts.
          Your order has been received.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mt-8 text-left">
          <p className="text-sm text-gray-500 mb-2">
            Your Order ID
          </p>

          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-gray-900 break-all">
              {orderId}
            </span>

            <button
              onClick={copyOrderId}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm shrink-0"
            >
              <Copy size={16} />
              Copy
            </button>
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
            <span className="text-gray-600">
              Product Total
            </span>

            <span className="font-bold text-gray-900">
              ₹{formatPrice(order.total)}
            </span>
          </div>
        </div>

        <div className="mt-7 bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex justify-center mb-3">
            <MessageCircle
              size={32}
              className="text-green-600"
            />
          </div>

          <h2 className="font-bold text-gray-900 text-lg">
            Confirm Your Order on WhatsApp
          </h2>

          <p className="text-sm text-gray-600 mt-2 mb-5">
            Send your order details to EVA Auto Parts on WhatsApp
            for confirmation.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-5 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <MessageCircle size={21} />
            Send Order on WhatsApp
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-7">
          <Link
            to="/shop"
            className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>

          <Link
            to="/"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Home
          </Link>
        </div>

      </div>
    </div>
  );
}
