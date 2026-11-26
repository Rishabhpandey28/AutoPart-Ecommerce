import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BadgePercent } from "lucide-react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";

export default function Deals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/products?deal=1&limit=200")
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <span className="rounded-full bg-orange-100 p-3 text-orange-600">
          <BadgePercent size={28} />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Today&apos;s Deals</h1>
          <p className="text-gray-500">Limited-time offers on auto parts</p>
        </div>
      </div>

      {loading && <p className="py-16 text-center text-gray-500">Loading...</p>}

      {error && (
        <p className="rounded-xl border bg-white p-8 text-center text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="rounded-xl border bg-white p-12 text-center text-gray-500">
          <p>No deals running right now. Please check back soon!</p>
          <Link
            to="/shop"
            className="mt-4 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Browse all products
          </Link>
        </div>
      )}

      {products.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} p={p} />
          ))}
        </div>
      )}
    </main>
  );
}