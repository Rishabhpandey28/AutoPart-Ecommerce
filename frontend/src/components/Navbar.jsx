
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  Phone,
  Wrench,
  MessageCircle,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const BRAND = "EVA Auto Parts";
const WHATSAPP_NUMBER = "919999999999";

const CATEGORIES = [
  { name: "Engine Parts", items: ["Pistons & Rings", "Gaskets", "Filters", "Belts & Chains"] },
  { name: "Brakes", items: ["Brake Pads", "Brake Discs", "Brake Shoes", "Brake Fluid"] },
  { name: "Suspension", items: ["Shock Absorbers", "Springs", "Control Arms", "Bushings"] },
  { name: "Electrical", items: ["Batteries", "Headlights", "Starters", "Wiring & Fuses"] },
  { name: "Body & Exterior", items: ["Mirrors", "Bumpers", "Wipers", "Lights"] },
  { name: "Oils & Fluids", items: ["Engine Oil", "Coolant", "Gear Oil", "Grease"] },
];

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop All", href: "/shop" },
  { label: "Deals", href: "/deals" },
  { label: "Contact", href: "/contact" },
];

const categoryUrl = (name) =>
  `/category/${name.toLowerCase().replace(/\W+/g, "-")}`;

export default function Navbar() {
  const { cartCount } = useCart();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openCat, setOpenCat] = useState(null);
  const [megaOpen, setMegaOpen] = useState(false);
  const [search, setSearch] = useState("");

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi, I want to order auto parts."
  )}`;

  const closeMobile = () => setMobileOpen(false);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) return;

    window.location.href = `/shop?q=${encodeURIComponent(search.trim())}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">

      {/* Top bar */}
      <div className="bg-gray-900 text-xs text-gray-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <p className="truncate">
            Genuine & aftermarket parts • Fast delivery
          </p>

          <a
            href={`tel:+${WHATSAPP_NUMBER}`}
            className="hidden items-center gap-1 hover:text-white sm:flex"
          >
            <Phone size={12} />
            +{WHATSAPP_NUMBER}
          </a>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">

        <button
          className="rounded-md p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-extrabold text-gray-900"
        >
          <span className="rounded-lg bg-orange-500 p-1.5 text-white">
            <Wrench size={20} />
          </span>
          <span className="hidden sm:inline">{BRAND}</span>
        </Link>

        {/* Desktop links */}
        <div className="ml-6 hidden items-center gap-1 lg:flex">

          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              onClick={() => setMegaOpen(!megaOpen)}
              className="flex items-center gap-1 rounded-md px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-orange-600"
            >
              Categories
              <ChevronDown
                size={16}
                className={`transition ${megaOpen ? "rotate-180" : ""}`}
              />
            </button>

            {megaOpen && (
              <div className="absolute left-0 top-full w-[640px] rounded-xl border bg-white p-6 shadow-xl">
                <div className="grid grid-cols-3 gap-6">
                  {CATEGORIES.map((cat) => (
                    <div key={cat.name}>
                      <Link
                        to={categoryUrl(cat.name)}
                        onClick={() => setMegaOpen(false)}
                        className="mb-2 block font-semibold text-gray-900 hover:text-orange-600"
                      >
                        {cat.name}
                      </Link>

                      <ul className="space-y-1">
                        {cat.items.map((item) => (
                          <li key={item}>
                            <Link
                              to={categoryUrl(cat.name)}
                              onClick={() => setMegaOpen(false)}
                              className="text-sm text-gray-600 hover:text-orange-600"
                            >
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="rounded-md px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-orange-600"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop search */}
        <form
          onSubmit={handleSearch}
          className="mx-4 hidden flex-1 md:flex"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by part name, number or vehicle..."
            className="w-full rounded-l-lg border border-r-0 border-gray-300 px-4 py-2 text-sm outline-none focus:border-orange-500"
          />

          <button
            type="submit"
            className="rounded-r-lg bg-orange-500 px-4 text-white hover:bg-orange-600"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </form>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1 md:ml-0">

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600 xl:flex"
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>

          <Link
            to="/cart"
            className="relative rounded-md p-2 text-gray-700 hover:bg-gray-100"
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={22} />

            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Mobile search */}
      <form onSubmit={handleSearch} className="flex px-4 pb-3 md:hidden">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search parts..."
          className="w-full rounded-l-lg border border-r-0 border-gray-300 px-4 py-2 text-sm outline-none focus:border-orange-500"
        />

        <button
          type="submit"
          className="rounded-r-lg bg-orange-500 px-4 text-white"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </form>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          mobileOpen ? "visible" : "invisible"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMobile}
        />

        <aside
          className={`absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-white shadow-xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b p-4">
            <span className="text-lg font-bold">{BRAND}</span>

            <button
              onClick={closeMobile}
              aria-label="Close menu"
              className="rounded-md p-1 hover:bg-gray-100"
            >
              <X size={22} />
            </button>
          </div>

          <div className="p-2">
            {LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={closeMobile}
                className="block rounded-md px-3 py-3 font-medium text-gray-800 hover:bg-gray-100"
              >
                {link.label}
              </Link>
            ))}

            <p className="mt-3 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Categories
            </p>

            {CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <button
                  onClick={() =>
                    setOpenCat(openCat === cat.name ? null : cat.name)
                  }
                  className="flex w-full items-center justify-between rounded-md px-3 py-3 font-medium text-gray-800 hover:bg-gray-100"
                >
                  {cat.name}

                  <ChevronDown
                    size={16}
                    className={`transition ${
                      openCat === cat.name ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openCat === cat.name && (
                  <ul className="mb-1 ml-4 border-l pl-3">
                    {cat.items.map((item) => (
                      <li key={item}>
                        <Link
                          to={categoryUrl(cat.name)}
                          onClick={closeMobile}
                          className="block py-2 text-sm text-gray-600 hover:text-orange-600"
                        >
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="border-t p-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-green-500 py-3 font-semibold text-white"
            >
              <MessageCircle size={18} />
              Order on WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </header>
  );
}
