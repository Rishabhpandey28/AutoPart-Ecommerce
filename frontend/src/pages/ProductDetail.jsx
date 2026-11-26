import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Minus,
  Plus,
  Check,
  ChevronRight,
  Truck,
  ShieldCheck,
  Headphones,
} from "lucide-react";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import ImageCarousel, { getImages } from "../components/ImageCarousel";

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={18}
          className={
            i <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    setQty(1);
    setAdded(false);
    setImgIdx(0);
    setRelated([]);

    api
      .get(`/products/${id}`)
      .then((p) => {
        setProduct(p);
        if (p.category) {
          api
            .get(`/products?category=${encodeURIComponent(p.category)}&limit=5`)
            .then((list) => setRelated(list.filter((x) => x._id !== p._id).slice(0, 4)))
            .catch(() => {});
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="py-24 text-center text-gray-500">Loading...</p>;
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <p className="mt-2 text-gray-500">{error}</p>
        <Link
          to="/shop"
          className="mt-6 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const p = product;
  const images = getImages(p);
  const hasDiscount = p.oldPrice > p.price;
  const discount = hasDiscount
    ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
    : 0;
  const saved = hasDiscount ? p.oldPrice - p.price : 0;
  const outOfStock = p.stock <= 0;
  const maxQty = Math.max(1, Math.min(p.stock, 100));

  const handleAdd = () => {
    addToCart(p, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <Link to="/" className="hover:text-orange-600">Home</Link>
        <ChevronRight size={14} />
        <Link to="/shop" className="hover:text-orange-600">Shop</Link>
        {p.category && (
          <>
            <ChevronRight size={14} />
            <Link
              to={`/shop?category=${encodeURIComponent(p.category)}`}
              className="hover:text-orange-600"
            >
              {p.category}
            </Link>
          </>
        )}
        <ChevronRight size={14} />
        <span className="line-clamp-1 text-gray-800">{p.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery: swipe the big image or tap a thumbnail */}
        <div>
          <div className="group relative h-[320px] overflow-hidden rounded-2xl border bg-gray-100 sm:h-[420px] lg:h-[520px]">
            <ImageCarousel
              images={images}
              alt={p.name}
              fit="contain"
              active={imgIdx}
              onChange={setImgIdx}
              dotsClass="bottom-3"
            />

            {p.tag && (
              <span className="pointer-events-none absolute left-3 top-3 rounded bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                {p.tag}
              </span>
            )}
            {hasDiscount && (
              <span className="pointer-events-none absolute right-3 top-3 rounded bg-orange-500 px-3 py-1 text-sm font-bold text-white">
                -{discount}% OFF
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setImgIdx(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-gray-100 sm:h-20 sm:w-20 ${
                    i === imgIdx ? "border-orange-500" : "border-transparent"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {p.brand && (
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              {p.brand}
            </p>
          )}

          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            {p.name}
          </h1>

          <div className="mt-3 flex items-center gap-2">
            <Stars rating={p.rating} />
            <span className="text-sm font-medium text-gray-700">{p.rating} / 5</span>
          </div>

          {/* Price block */}
          <div className="mt-5 rounded-xl bg-gray-50 p-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-extrabold text-gray-900">
                {inr(p.price)}
              </span>

              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through decoration-red-500 decoration-2">
                    {inr(p.oldPrice)}
                  </span>
                  <span className="rounded bg-green-100 px-2 py-0.5 text-sm font-bold text-green-700">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {hasDiscount && (
              <p className="mt-1 text-sm font-medium text-green-700">
                You save {inr(saved)}
              </p>
            )}
          </div>

          {/* Stock */}
          <p className="mt-4 text-sm font-semibold">
            {outOfStock ? (
              <span className="text-red-600">Out of Stock</span>
            ) : p.stock <= 5 ? (
              <span className="text-orange-600">Only {p.stock} left in stock</span>
            ) : (
              <span className="text-green-600">In Stock</span>
            )}
          </p>

          {/* Quantity + add to cart */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={outOfStock || qty <= 1}
                aria-label="Decrease quantity"
                className="p-3 hover:bg-gray-100 disabled:opacity-40"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-semibold">{outOfStock ? 0 : qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                disabled={outOfStock || qty >= maxQty}
                aria-label="Increase quantity"
                className="p-3 hover:bg-gray-100 disabled:opacity-40"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 sm:flex-none"
            >
              {added ? <Check size={18} /> : <ShoppingCart size={18} />}
              {outOfStock ? "Out of Stock" : added ? "Added to Cart" : "Add to Cart"}
            </button>

            {added && (
              <Link to="/cart" className="text-sm font-semibold text-orange-600 hover:underline">
                View Cart
              </Link>
            )}
          </div>

          {/* Specs */}
          <dl className="mt-6 divide-y rounded-xl border text-sm">
            {[
              ["Brand", p.brand],
              ["Category", p.category],
              ["Rating", `${p.rating} / 5`],
              ["Availability", outOfStock ? "Out of Stock" : `${p.stock} in stock`],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex justify-between px-4 py-2.5">
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="font-medium text-gray-900">{v}</dd>
                </div>
              ))}
          </dl>

          {/* Trust */}
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
            <div className="rounded-lg bg-gray-50 p-3">
              <Truck size={20} className="mx-auto mb-1 text-orange-500" />
              Fast Delivery
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <ShieldCheck size={20} className="mx-auto mb-1 text-orange-500" />
              Genuine Quality
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <Headphones size={20} className="mx-auto mb-1 text-orange-500" />
              Expert Help
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="mt-10 rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900">Description</h2>
        <p className="mt-3 whitespace-pre-line text-gray-600">
          {p.description || "No description available for this product."}
        </p>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-bold text-gray-900">
            More in {p.category}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r._id} p={r} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}