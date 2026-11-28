import { useEffect, useState } from "react";
import { Phone, MessageCircle, Mail, MapPin, Send, Wrench } from "lucide-react";
import { api } from "../lib/api";

const TOPICS = ["Part enquiry", "Order help", "Delivery question", "Other"];

const DEFAULTS = {
  storeName: "AutoParts Hub",
  whatsapp: "+91 92029 60158",
  email: "",
  address: "",
};

export default function Contact() {
  // Store details come from Admin → Settings
  const [store, setStore] = useState(DEFAULTS);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    topic: TOPICS[0],
    message: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/settings")
      .then((s) => setStore({ ...DEFAULTS, ...s }))
      .catch(() => {});
  }, []);

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const waNumber = String(store.whatsapp).replace(/\D/g, "");
  const waBase = `https://wa.me/${waNumber}`;

  // The enquiry is sent to the store on WhatsApp
  const submit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Please enter your name.");

    const phone = form.phone.replace(/[\s()-]/g, "");
    if (!/^\+?[0-9]{10,13}$/.test(phone)) {
      return setError("Please enter a valid mobile number.");
    }

    if (form.message.trim().length < 5) {
      return setError("Please write your message.");
    }

    const text =
      `Hi ${store.storeName}, I have an enquiry.\n\n` +
      `Name: ${form.name.trim()}\n` +
      `Phone: ${form.phone.trim()}\n` +
      `Topic: ${form.topic}\n\n` +
      `${form.message.trim()}`;

    window.open(`${waBase}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100";

  const cards = [
    {
      icon: Phone,
      title: "Call us",
      text: `+${waNumber}`,
      href: `tel:+${waNumber}`,
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      text: "Chat with us instantly",
      href: `${waBase}?text=${encodeURIComponent("Hi, I need help with auto parts.")}`,
      external: true,
    },
    store.email && {
      icon: Mail,
      title: "Email",
      text: store.email,
      href: `mailto:${store.email}`,
    },
    store.address && {
      icon: MapPin,
      title: "Visit us",
      text: store.address,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`,
      external: true,
    },
  ].filter(Boolean);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-3 inline-flex rounded-full bg-orange-100 p-3 text-orange-600">
          <Wrench size={26} />
        </span>
        <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
        <p className="mt-1 text-gray-500">
          Not sure which part you need? Tell us your vehicle and we&apos;ll help.
        </p>
      </div>

      {/* Contact cards */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ icon: Icon, title, text, href, external }) => (
          <a
            key={title}
            href={href}
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
            className="group flex flex-col items-center gap-2 rounded-xl border bg-white p-6 text-center transition hover:border-orange-500 hover:shadow-md"
          >
            <span className="rounded-full bg-gray-100 p-4 text-gray-700 transition group-hover:bg-orange-500 group-hover:text-white">
              <Icon size={24} />
            </span>
            <span className="font-semibold text-gray-900">{title}</span>
            <span className="break-words text-sm text-gray-500">{text}</span>
          </a>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Enquiry form */}
        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-xl font-bold text-gray-900">Send an enquiry</h2>
            <p className="text-sm text-gray-500">
              Your message opens in WhatsApp so you can send it to us directly.
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Your name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="Full name"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mobile number *
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="10-digit mobile number"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Topic
            </label>
            <select value={form.topic} onChange={set("topic")} className={inputCls}>
              {TOPICS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Message *
            </label>
            <textarea
              rows={5}
              maxLength={800}
              value={form.message}
              onChange={set("message")}
              placeholder="Tell us the part, vehicle make/model and year..."
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 py-3 font-semibold text-white transition hover:bg-green-600"
          >
            <Send size={18} />
            Send on WhatsApp
          </button>
        </form>

        {/* Map (only when the store has an address) */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          {store.address ? (
            <iframe
              title="Store location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(store.address)}&output=embed`}
              className="h-full min-h-[320px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center p-8 text-center text-gray-400">
              <MapPin size={40} className="mb-2" />
              <p className="text-sm">
                City : Dewas 455001 Madhya Pradesh
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}