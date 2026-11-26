
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

const inr = (n) =>
  `₹${Number(n).toLocaleString("en-IN")}`;

function Stars({ rating = 0, size = 18 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
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

// Customer Reviews UI

function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch reviews from MongoDB
  const fetchReviews = async () => {
    try {
      const data = await api.get(`/reviews/${productId}`);

      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
    } catch (error) {
      setMessage(error.message || "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setMessage("");
    fetchReviews();
  }, [productId]);

  // Submit review to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!name.trim() || !comment.trim() || !rating) {
      setMessage("Please enter your name, rating and review.");
      return;
    }

    if (name.trim().length > 100) {
      setMessage("Name cannot exceed 100 characters.");
      return;
    }

    if (comment.trim().length < 3) {
      setMessage("Review must contain at least 3 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await api.post(`/reviews/${productId}`, {
        customerName: name.trim(),
        rating,
        comment: comment.trim(),
      });

      // Update reviews and rating summary
      await fetchReviews();

      setName("");
      setComment("");
      setRating(0);
      setHoverRating(0);

      setMessage(data.message || "Thank you! Your review has been submitted.");
    } catch (error) {
      setMessage(error.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-10 rounded-2xl border bg-white p-5 sm:p-7">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Customer Reviews
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Share your experience with this product.
        </p>
      </div>

      {/* Rating Summary */}
      <div className="mb-8 flex flex-col gap-4 rounded-xl bg-gray-50 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-4xl font-extrabold text-gray-900">
            {Number(averageRating).toFixed(1)}
            <span className="text-lg font-medium text-gray-400">/5</span>
          </p>

          <Stars rating={averageRating} size={20} />

          <p className="mt-1 text-sm text-gray-500">
            {totalReviews} {totalReviews === 1 ? "Review" : "Reviews"}
          </p>
        </div>

        <div className="sm:ml-8">
          <p className="font-semibold text-gray-800">
            Have you purchased this product?
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Let other customers know what you think.
          </p>
        </div>
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">
          Write a Review
        </h3>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Your Rating
          </label>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`Rate ${star} out of 5`}
                className="rounded p-1 transition hover:scale-110"
              >
                <Star
                  size={28}
                  className={
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Your Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={100}
            required
            className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Your Review
          </label>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            maxLength={1000}
            required
            className="w-full resize-y rounded-lg border px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />

          <p className="mt-1 text-right text-xs text-gray-400">
            {comment.length}/1000
          </p>
        </div>

        {message && (
          <p
            className={`text-sm ${
              message.includes("successfully") ||
              message.startsWith("Thank")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      {/* Review List */}
      <div className="mt-10 border-t pt-7">
        <h3 className="mb-5 text-lg font-bold text-gray-900">
          Customer Feedback
        </h3>

        {loading ? (
          <p className="py-8 text-center text-gray-500">
            Loading reviews...
          </p>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed py-10 text-center">
            <Star size={32} className="mx-auto text-gray-300" />
            <p className="mt-3 font-medium text-gray-700">
              No reviews yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Be the first to review this product.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="border-b pb-5 last:border-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {review.customerName}
                    </p>
                    <Stars rating={review.rating} size={16} />
                  </div>

                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
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
            .get(
              `/products?category=${encodeURIComponent(
                p.category
              )}&limit=5`
            )
            .then((list) =>
              setRelated(
                list
                  .filter((x) => x._id !== p._id)
                  .slice(0, 4)
              )
            )
            .catch(() => {});
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <p className="py-24 text-center text-gray-500">
        Loading...
      </p>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Product not found
        </h1>

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
        <Link to="/" className="hover:text-orange-600">
          Home
        </Link>

        <ChevronRight size={14} />

        <Link to="/shop" className="hover:text-orange-600">
          Shop
        </Link>

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

        <span className="line-clamp-1 text-gray-800">
          {p.name}
        </span>
      </nav>

      {/* Product Gallery and Details */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
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
                    i === imgIdx
                      ? "border-orange-500"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-contain"
                  />
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
            <span className="text-sm font-medium text-gray-700">
              {p.rating} / 5
            </span>
          </div>

          {/* Price */}
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
              <span className="text-orange-600">
                Only {p.stock} left in stock
              </span>
            ) : (
              <span className="text-green-600">In Stock</span>
            )}
          </p>

          {/* Quantity and Add to Cart */}
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

              <span className="w-12 text-center font-semibold">
                {outOfStock ? 0 : qty}
              </span>

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

              {outOfStock
                ? "Out of Stock"
                : added
                ? "Added to Cart"
                : "Add to Cart"}
            </button>

            {added && (
              <Link
                to="/cart"
                className="text-sm font-semibold text-orange-600 hover:underline"
              >
                View Cart
              </Link>
            )}
          </div>

          {/* Specifications */}
          <dl className="mt-6 divide-y rounded-xl border text-sm">
            {[
              ["Brand", p.brand],
              ["Category", p.category],
              ["Rating", `${p.rating} / 5`],
              [
                "Availability",
                outOfStock ? "Out of Stock" : `${p.stock} in stock`,
              ],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between px-4 py-2.5"
                >
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="font-medium text-gray-900">{v}</dd>
                </div>
              ))}
          </dl>

          {/* Trust Information */}
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
            <div className="rounded-lg bg-gray-50 p-3">
              <Truck
                size={20}
                className="mx-auto mb-1 text-orange-500"
              />
              Fast Delivery
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <ShieldCheck
                size={20}
                className="mx-auto mb-1 text-orange-500"
              />
              Genuine Quality
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <Headphones
                size={20}
                className="mx-auto mb-1 text-orange-500"
              />
              Expert Help
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="mt-10 rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900">
          Description
        </h2>

        <p className="mt-3 whitespace-pre-line text-gray-600">
          {p.description ||
            "No description available for this product."}
        </p>
      </section>

      {/* Customer Reviews */}
      <ReviewSection productId={p._id} />

      {/* Related Products */}
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
