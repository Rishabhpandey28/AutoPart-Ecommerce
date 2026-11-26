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
  ShoppingCart,
  MessageCircle,
  Star,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { useCart } from "../context/CartContext";
// ---- Edit these ----
// Updated from the dashboard Settings page when the page loads
let WHATSAPP_NUMBER = "9111518187";
const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

const ICONS = {
  "Engine Parts": Cog,
  Brakes: Disc3,
  Suspension: Wrench,
  Electrical: Zap,
  "Body & Exterior": Car,
  "Oils & Fluids": Droplets,
};

const BRANDS = ["BrakeMax", "FilterPro", "RideSoft", "PowerCell", "BrightBeam", "LubeX"];

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


function ProductCard({ p }) {
  const { addToCart } = useCart();

  const hasDiscount = p.oldPrice > p.price;

  const discount = hasDiscount
    ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
    : 0;

  const outOfStock = p.stock <= 0;

  const handleAddToCart = () => {
    addToCart(p, 1);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-white transition hover:shadow-lg">
      <div className="relative flex h-40 items-center justify-center bg-gray-100 sm:h-48">
        {p.image ? (
          <img
            src={p.image}
            alt={p.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <Cog
            size={56}
            className="text-gray-300 transition group-hover:rotate-45 group-hover:text-orange-400"
          />
        )}

        {p.tag && (
          <span className="absolute left-2 top-2 rounded bg-gray-900 px-2 py-0.5 text-xs font-semibold text-white">
            {p.tag}
          </span>
        )}

        {hasDiscount && (
          <span className="absolute right-2 top-2 rounded bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {p.brand && (
          <p className="text-xs uppercase tracking-wide text-gray-400">
            {p.brand}
          </p>
        )}

        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold text-gray-900 sm:text-base">
          {p.name}
        </h3>

        <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          {p.rating}
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            ₹{p.price.toLocaleString("en-IN")}
          </span>

          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              ₹{p.oldPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <ShoppingCart size={16} />
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}


export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [, setSettingsLoaded] = useState(false);

  useEffect(() => {
    api.get("/products?limit=8").then(setProducts).catch(() => {});
    api.get("/categories").then(setCategories).catch(() => {});
    api
      .get("/settings")
      .then((st) => {
        if (st.whatsapp) WHATSAPP_NUMBER = st.whatsapp;
        setSettingsLoaded(true); // re-render with the new number
      })
      .catch(() => {});
  }, []);

  return (
    <main className="bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-block rounded-full bg-orange-500/20 px-3 py-1 text-sm font-medium text-orange-300">
              Your one-stop auto parts store
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
              Right Parts. <span className="text-orange-500">Right Price.</span> Right Now.
            </h1>
            <p className="mt-4 max-w-lg text-gray-300">
              Brakes, engine parts, batteries, filters and more for all major vehicles. Search by part
              name or vehicle and get it delivered fast.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
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

          {/* Vehicle finder */}
          <div className="rounded-2xl bg-white p-6 text-gray-900 shadow-xl">
            <h2 className="text-xl font-bold">Find parts for your vehicle</h2>
            <p className="text-sm text-gray-500">Select your vehicle to see compatible parts</p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-4 space-y-3">
              {["Make", "Model", "Year"].map((label) => (
                <select
                  key={label}
                  defaultValue=""
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500"
                >
                  <option value="" disabled>
                    Select {label}
                  </option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              ))}
              <button className="w-full rounded-lg bg-gray-900 py-3 font-semibold text-white hover:bg-orange-600">
                Find Parts
              </button>
            </form>
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
          {categories.map(({ _id, name }) => {
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
        {products.length === 0 && (
          <p className="rounded-xl border bg-white p-8 text-center text-gray-500">
            No products yet. Add some from the admin dashboard.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} p={p} />
          ))}
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

      {/* Brands */}
      <section className="border-y bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <SectionHeading title="Top Brands" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {BRANDS.map((b) => (
              <div
                key={b}
                className="flex h-20 items-center justify-center rounded-lg border bg-gray-50 text-lg font-bold text-gray-400 transition hover:text-orange-500"
              >
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold text-white">AutoParts Hub</h3>
            <p className="mt-2 text-sm text-gray-400">Quality auto parts at honest prices, delivered to your door.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white">Shop</h4>
            <ul className="mt-2 space-y-1 text-sm">
              {categories.slice(0, 4).map((c) => (
                <li key={c._id}><a href="#" className="hover:text-orange-400">{c.name}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Help</h4>
            <ul className="mt-2 space-y-1 text-sm">
              <li><a href="#" className="hover:text-orange-400">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-orange-400">Returns</a></li>
              <li><a href="#" className="hover:text-orange-400">FAQs</a></li>
              <li><a href="/contact" className="hover:text-orange-400">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Contact</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center gap-2"><Phone size={14} /> +{WHATSAPP_NUMBER}</li>
              <li className="flex items-center gap-2"><Mail size={14} /> hello@autopartshub.com</li>
              <li className="flex items-center gap-2"><MapPin size={14} /> Your city, State</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} AutoParts Hub. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
