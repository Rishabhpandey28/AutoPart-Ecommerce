import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X, PackageSearch } from "lucide-react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";

const SORTS = [
  { value: "new", label: "Newest" },
  { value: "low", label: "Price: Low to High" },
  { value: "high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const q = params.get("q") || "";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(q);
  const [sort, setSort] = useState("new");
  const [inStockOnly, setInStockOnly] = useState(false);

  // remember the last value we put in the URL ourselves
  const lastSent = useRef(q);

  // keep the search box in sync only when the URL was changed from outside
  // (e.g. the Navbar search), never while the person is typing here
  useEffect(() => {
    if (q !== lastSent.current) {
      lastSent.current = q;
      setSearch(q);
    }
  }, [q]);

  // live search: update the URL 350ms after the person stops typing
  useEffect(() => {
    const term = search.trim();
    if (term === lastSent.current) return;

    const t = setTimeout(() => {
      lastSent.current = term;
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          term ? next.set("q", term) : next.delete("q");
          return next;
        },
        { replace: true }
      );
    }, 350);

    return () => clearTimeout(t);
  }, [search, setParams]);

  useEffect(() => {
    api.get("/categories").then(setCategories).catch(() => {});
  }, []);

  // load products whenever category / search in the URL changes
  useEffect(() => {
    setLoading(true);
    setError("");

    const query = new URLSearchParams({ limit: "200" });
    if (category) query.set("category", category);
    if (q) query.set("q", q);

    api
      .get(`/products?${query}`)
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [category, q]);

  const update = (changes) => {
    if ("q" in changes) {
      lastSent.current = changes.q;
      setSearch(changes.q);
    }
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(changes)) {
        v ? next.set(k, v) : next.delete(k);
      }
      return next;
    });
  };

  const submitSearch = (e) => {
    e.preventDefault();
    update({ q: search.trim() }); // Enter searches immediately
  };

  const visible = useMemo(() => {
    let list = inStockOnly ? products.filter((p) => p.stock > 0) : [...products];
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list; // "new" keeps the API order (newest first)
  }, [products, sort, inStockOnly]);

  const chip = (active) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
      active
        ? "border-orange-500 bg-orange-500 text-white"
        : "bg-white text-gray-700 hover:border-orange-500 hover:text-orange-600"
    }`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {category || "Shop All"}
        </h1>
        <p className="mt-1 text-gray-500">
          {q ? `Results for "${q}"` : "Browse all auto parts"}
        </p>
      </div>

      {/* Search + sort */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row">
        <form onSubmit={submitSearch} className="flex flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search parts..."
            className="w-full rounded-l-lg border border-r-0 border-gray-300 px-4 py-2 text-sm outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            aria-label="Search"
            className="rounded-r-lg bg-orange-500 px-4 text-white hover:bg-orange-600"
          >
            <Search size={18} />
          </button>
        </form>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="h-4 w-4 accent-orange-500"
          />
          In stock only
        </label>
      </div>

      {/* Category filter */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => update({ category: "" })} className={chip(!category)}>
          All
        </button>
        {categories.map((c) => (
          <button
            key={c._id}
            onClick={() => update({ category: c.name })}
            className={chip(category === c.name)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Active filters + count */}
      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-gray-600">
        {!loading && !error && (
          <span>
            {visible.length} {visible.length === 1 ? "product" : "products"}
          </span>
        )}
        {q && (
          <button
            onClick={() => update({ q: "" })}
            className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 hover:bg-gray-200"
          >
            "{q}" <X size={14} />
          </button>
        )}
      </div>

      {loading && <p className="py-16 text-center text-gray-500">Loading...</p>}

      {error && (
        <p className="rounded-xl border bg-white p-8 text-center text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="rounded-xl border bg-white p-12 text-center text-gray-500">
          <PackageSearch size={40} className="mx-auto mb-3 text-gray-300" />
          No products found. Try a different search or category.
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p._id} p={p} />
          ))}
        </div>
      )}
    </main>
  );
}