import { useEffect, useState } from "react";
import { api } from "../lib/api";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  BadgePercent,
  Headphones,
  Cog,
  Disc3,
  Zap,
  Car,
  Droplets,
  Wrench,
  MessageCircle,
} from "lucide-react";
import ProductCard from "../components/ProductCard";

// ---- Edit these ----
const ICONS = {
  "Engine Parts": Cog,
  Brakes: Disc3,
  Suspension: Wrench,
  Electrical: Zap,
  "Body & Exterior": Car,
  "Oils & Fluids": Droplets,
};

const FEATURES = [
  { icon: Truck, title: "Fast Delivery", text: "Quick dispatch across the country" },
  { icon: ShieldCheck, title: "Genuine Quality", text: "Tested, reliable parts only" },
  { icon: BadgePercent, title: "Best Prices", text: "Wholesale-level rates for everyone" },
  { icon: Headphones, title: "Expert Help", text: "Find the right part for your vehicle" },
];
// --------------------

function SectionHeading({ title, link }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h2>
      {link && (
        <a href={link} className="flex items-center gap-1 text-sm font-semibold text-orange-600 hover:underline">
          View all <ArrowRight size={16} />
        </a>
      )}
    </div>
  );
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />;
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [whatsappNumber, setWhatsappNumber] = useState("919202960158");
  const waLink = (text) =>
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

  useEffect(() => {
    Promise.allSettled([
      api.get("/products?limit=8").then(setProducts),
      api.get("/categories").then(setCategories),
      api.get("/settings").then((st) => {
        if (st.whatsapp) setWhatsappNumber(String(st.whatsapp).replace(/\D/g, ""));
      }),
    ]).finally(() => setLoading(false));
  }, []);

  const uniqueBrands = [
    ...new Set(products.map((product) => product.brand?.trim()).filter(Boolean)),
  ];

  // Repeat the list so ONE group is always wider than any screen.
  const MIN_ITEMS_PER_GROUP = 16;
  const repeatCount = Math.ceil(MIN_ITEMS_PER_GROUP / Math.max(uniqueBrands.length, 1));
  const brands = Array.from({ length: repeatCount }, () => uniqueBrands).flat();

  return (
    <main className="bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-orange-500/20 px-3 py-1 text-sm font-medium text-orange-300">
              Your one-stop auto parts store
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
              Right Parts. <span className="text-orange-500">Right Price.</span> Right Now.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-gray-300">
              Brakes, engine parts, batteries, filters and more for all major vehicles. Search by part
              name or vehicle and get it delivered fast.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href="/shop" className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold hover:bg-orange-600">
                Shop Now <ArrowRight size={18} />
              </a>
              <a
                href={waLink("Hi, I need help finding a part.")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border border-gray-500 px-6 py-3 font-semibold hover:bg-white/10"
              >
                <MessageCircle size={18} /> Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="rounded-full bg-orange-100 p-3 text-orange-600">
                <Icon size={22} />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="hidden text-xs text-gray-500 sm:block">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeading title="Shop by Category" link="/shop" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)
            : categories.map(({ _id, name }) => {
                const Icon = ICONS[name] || Cog;
                return (
                  <a
                    key={_id}
                    href={`/category/${name.toLowerCase().replace(/\W+/g, "-")}`}
                    className="group flex flex-col items-center gap-3 rounded-xl border bg-white p-5 text-center transition hover:border-orange-500 hover:shadow-md"
                  >
                    <span className="rounded-full bg-gray-100 p-4 text-gray-700 transition group-hover:bg-orange-500 group-hover:text-white">
                      <Icon size={28} />
                    </span>
                    <span className="text-sm font-semibold text-gray-800">{name}</span>
                  </a>
                );
              })}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <SectionHeading title="Featured Products" link="/shop" />
        {!loading && products.length === 0 && (
          <p className="rounded-xl border bg-white p-8 text-center text-gray-500">
            No products yet. Add some from the admin dashboard.
          </p>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72" />)
            : products.map((p) => <ProductCard key={p._id} p={p} />)}
        </div>
      </section>

      {/* Promo banner */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-100">Limited time</p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">Up to 30% off on Brake & Suspension parts</h2>
          </div>
          <a href="/deals" className="rounded-lg bg-white px-6 py-3 font-semibold text-orange-600 hover:bg-gray-100">
            Grab the Deal
          </a>
        </div>
      </section>

      {/* Brands marquee */}
      {loading ? (
        <section className="border-y bg-white py-8">
          <div className="mx-auto max-w-7xl px-4">
            <Skeleton className="h-16" />
          </div>
        </section>
      ) : (
        uniqueBrands.length > 0 && (
          <section className="overflow-hidden border-y bg-white py-8">
            <div className="mx-auto max-w-7xl px-4">
              <SectionHeading title="Top Brands" />
            </div>

            <div className="brand-marquee w-full overflow-hidden">
              <div
                className="brand-track flex w-max"
                style={{ "--brand-duration": `${brands.length * 5}s` }}
              >
                {[0, 1].map((group) => (
                  <div
                    key={group}
                    className="flex shrink-0 items-center gap-4 pr-4"
                    aria-hidden={group === 1}
                  >
                    {brands.map((brand, index) => (
                      <div
                        key={`${group}-${brand}-${index}`}
                        className="flex h-16 min-w-44 shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-gray-300 bg-gray-50 px-8 font-bold text-gray-700 transition hover:border-orange-500 hover:text-orange-500"
                      >
                        {brand}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      )}

      {/* WhatsApp CTA */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-2xl bg-gray-900 p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Can’t find the part you need?</h2>
          <p className="mx-auto mt-2 max-w-xl text-gray-300">
            Send us your vehicle details or a photo of the part and we’ll find it for you.
          </p>
          <a
            href={waLink("Hi, I can't find a part. Can you help?")}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-semibold hover:bg-green-600"
          >
            <MessageCircle size={18} /> Chat on WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}