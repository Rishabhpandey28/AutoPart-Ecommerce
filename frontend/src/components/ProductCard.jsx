import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "../context/CartContext";
import ImageCarousel, { getImages } from "./ImageCarousel";

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// "2d 5h left" / "5h 10m left" for deal products
function timeLeft(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "";
  const mins = Math.floor(ms / 60000);
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

function Stars({ rating }) {
  return (
    <span className="flex items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={
            i <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }
        />
      ))}
    </span>
  );
}

/*
  Mobile (below sm): horizontal "list" card like Amazon's app
    [ image | details ]  + full-width button
  sm and up: normal vertical grid card
*/
export default function ProductCard({ p }) {
  const { addToCart } = useCart();

  const hasDiscount = p.oldPrice > p.price;
  const discount = hasDiscount
    ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
    : 0;

  const outOfStock = p.stock <= 0;
  const link = `/product/${p._id}`;

  return (
    <div className="group flex h-full flex-row overflow-hidden rounded-xl border bg-white transition hover:shadow-lg sm:flex-col">
      {/* Swipeable images (tap an image to open the product page) */}
      <div className="relative min-h-[190px] w-2/5 shrink-0 overflow-hidden bg-gray-100 sm:h-48 sm:min-h-0 sm:w-full">
        <ImageCarousel
          images={getImages(p)}
          alt={p.name}
          to={link}
          fit="card"
          dotsClass={outOfStock ? "bottom-7" : "bottom-2"}
        />

        {p.tag && (
          <span className="pointer-events-none absolute left-2 top-2 rounded bg-gray-900 px-2 py-0.5 text-xs font-semibold text-white">
            {p.tag}
          </span>
        )}

        {/* On mobile the discount is shown in the text, like Amazon */}
        {hasDiscount && (
          <span className="pointer-events-none absolute right-2 top-2 hidden rounded bg-orange-500 px-2 py-0.5 text-xs font-bold text-white sm:block">
            -{discount}%
          </span>
        )}

        {outOfStock && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-red-600/90 py-1 text-center text-xs font-semibold text-white">
            Out of Stock
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        {/* Details (click opens the product page) */}
        <Link to={link} className="block">
          <h3 className="line-clamp-3 text-[15px] font-medium leading-snug text-gray-900 group-hover:text-orange-600 sm:line-clamp-2 sm:text-base sm:font-semibold">
            {p.name}
          </h3>

          {/* Brand / category chips */}
          {(p.brand || p.category) && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {p.brand && (
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                  {p.brand}
                </span>
              )}
              {p.category && (
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                  {p.category}
                </span>
              )}
            </div>
          )}

          {p.description && (
            <p className="mt-1 hidden line-clamp-2 text-xs text-gray-500 sm:block">
              {p.description}
            </p>
          )}

          {/* Rating */}
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-700">
            <span>{p.rating}</span>
            <Stars rating={p.rating} />
          </div>

          {/* Price */}
          <p className="mt-1.5 text-2xl font-medium text-gray-900 sm:text-xl sm:font-extrabold">
            {inr(p.price)}
          </p>

          {hasDiscount && (
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-red-600">({discount}% off)</span>{" "}
              M.R.P:{" "}
              <span className="line-through decoration-red-500">
                {inr(p.oldPrice)}
              </span>
            </p>
          )}

          {/* Deal timer */}
          {p.isDeal && p.dealEndsAt && timeLeft(p.dealEndsAt) && (
            <p className="mt-1 text-xs font-semibold text-red-600">
              Deal ends: {timeLeft(p.dealEndsAt)}
            </p>
          )}

          {/* Stock */}
          {!outOfStock && (
            <p
              className={`mt-1 text-xs font-medium ${
                p.stock <= 5 ? "text-orange-600" : "text-green-600"
              }`}
            >
              {p.stock <= 5 ? `Only ${p.stock} left` : "In Stock"}
            </p>
          )}
        </Link>

        <button
          onClick={() => addToCart(p, 1)}
          disabled={outOfStock}
          className="mt-3 flex items-center justify-center gap-2 rounded-full bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 sm:mt-auto sm:rounded-lg sm:py-2"
        >
          <ShoppingCart size={16} />
          {outOfStock ? "Out of Stock" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}