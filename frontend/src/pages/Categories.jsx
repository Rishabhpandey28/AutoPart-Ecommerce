import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Cog,
  Disc3,
  Zap,
  Car,
  Droplets,
  Wrench,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";

const ICONS = {
  "Engine Parts": Cog,
  Brakes: Disc3,
  Suspension: Wrench,
  Electrical: Zap,
  "Body & Exterior": Car,
  "Oils & Fluids": Droplets,
};

const slug = (name) => `cat-${name.toLowerCase().replace(/\W+/g, "-")}`;

// Horizontally scrollable product row with arrow buttons
function ProductRow({ list }) {
  const ref = useRef(null);

  const scroll = (dir) =>
    ref.current?.scrollBy({
      left: dir * Math.max(ref.current.clientWidth * 0.8, 240),
      behavior: "smooth",
    });

  return (
    <div className="group/row relative">
      <button
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border bg-white p-2 text-gray-700 shadow-md transition hover:bg-orange-500 hover:text-white md:flex"
      >
        <ChevronLeft size={20} />
      </button>

      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 sm:gap-5 [scrollbar-width:thin]"
      >
        {list.map((p) => (
          <div
            key={p._id}
            className="w-[88%] max-w-sm shrink-0 snap-start sm:w-56 sm:max-w-none lg:w-64"
          >
            <ProductCard p={p} />
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border bg-white p-2 text-gray-700 shadow-md transition hover:bg-orange-500 hover:text-white md:flex"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/categories"), api.get("/products?limit=200")])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // group products by category name
  const grouped = useMemo(() => {
    const map = {};
    for (const p of products) {
      (map[p.category] ||= []).push(p);
    }
    return map;
  }, [products]);

  const sections = categories.filter((c) => (grouped[c.name] || []).length > 0);

  const jumpTo = (name) =>
    document
      .getElementById(slug(name))
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
        <p className="mt-1 text-gray-500">
          Category chuniye aur uske saare parts ek hi jagah dekhiye.
        </p>
      </div>

      {loading && <p className="py-16 text-center text-gray-500">Loading...</p>}

      {error && (
        <p className="rounded-xl border bg-white p-8 text-center text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && sections.length === 0 && (
        <p className="rounded-xl border bg-white p-8 text-center text-gray-500">
          No products yet. Add some from the admin dashboard.
        </p>
      )}

      {/* Quick jump bar */}
      {sections.length > 0 && (
        <div className="-mx-4 mb-8 overflow-x-auto border-b bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex gap-2">
            {sections.map(({ _id, name, count }) => {
              const Icon = ICONS[name] || Cog;
              return (
                <button
                  key={_id}
                  onClick={() => jumpTo(name)}
                  className="flex shrink-0 items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-orange-500 hover:text-orange-600"
                >
                  <Icon size={16} />
                  {name}
                  <span className="rounded-full bg-gray-100 px-2 text-xs text-gray-500">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* One section per category */}
      <div className="space-y-12">
        {sections.map(({ _id, name }) => {
          const list = grouped[name];
          const Icon = ICONS[name] || Cog;
          return (
            <section key={_id} id={slug(name)} className="scroll-mt-32">
              <div className="mb-5 flex items-end justify-between">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                  <span className="rounded-full bg-orange-100 p-2 text-orange-600">
                    <Icon size={22} />
                  </span>
                  {name}
                  <span className="text-base font-normal text-gray-400">
                    ({list.length})
                  </span>
                </h2>

                <Link
                  to={`/shop?category=${encodeURIComponent(name)}`}
                  className="flex items-center gap-1 text-sm font-semibold text-orange-600 hover:underline"
                >
                  View all <ArrowRight size={16} />
                </Link>
              </div>

              <ProductRow list={list} />
            </section>
          );
        })}
      </div>
    </main>
  );
}