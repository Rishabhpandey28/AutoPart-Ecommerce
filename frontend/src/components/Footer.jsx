
import {
  Facebook,
  Instagram,
  MessageCircle,
  MapPin,
  Mail,
  Phone,
  ArrowUpRight,
} from "lucide-react";

const WEBSITE_URL = "https://fourfold-creative.onrender.com/";

export default function Footer() {
  return (
    <footer className="bg-[#050914] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-extrabold">
            EV <span className="text-orange-500">AUTO PARTS</span>
          </h2>

          <p className="mt-4 max-w-xs text-sm leading-7 text-gray-400">
            Your trusted destination for quality automotive parts and
            accessories. Find the right parts for your vehicle at the
            right price.
          </p>

          <div className="mt-5 flex gap-3">

          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-5 text-lg font-bold">Quick Links</h3>

          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <a href="/" className="transition hover:text-orange-500">
                Home
              </a>
            </li>
            <li>
              <a href="/shop" className="transition hover:text-orange-500">
                Shop
              </a>
            </li>
            <li>
              <a href="/cart" className="transition hover:text-orange-500">
                Shopping Cart
              </a>
            </li>
            <li>
              <a href="/deals" className="transition hover:text-orange-500">
                Deals
              </a>
            </li>
            <li>
              <a href="/contact" className="transition hover:text-orange-500">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h3 className="mb-5 text-lg font-bold">Customer Support</h3>

          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <a href="/contact" className="transition hover:text-orange-500">
                Help & Support
              </a>
            </li>
            <li>
              <a href="/contact" className="transition hover:text-orange-500">
                Order Enquiry
              </a>
            </li>
            <li>
              <a href="/contact" className="transition hover:text-orange-500">
                Delivery Information
              </a>
            </li>
            <li>
              <a href="/contact" className="transition hover:text-orange-500">
                Return & Refund Enquiry
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-5 text-lg font-bold">Get In Touch</h3>

          <div className="space-y-4 text-sm text-gray-400">
            <a
              href="/contact"
              className="flex items-start gap-3 transition hover:text-orange-500"
            >
              <MapPin size={18} className="mt-0.5 shrink-0 text-orange-500" />
              <span>Visit our Contact page for store information.</span>
            </a>

            <a
              href="/contact"
              className="flex items-center gap-3 transition hover:text-orange-500"
            >
              <Phone size={18} className="shrink-0 text-orange-500" />
              <span>Contact Us</span>
            </a>

            <a
              href="/contact"
              className="flex items-center gap-3 transition hover:text-orange-500"
            >
              <Mail size={18} className="shrink-0 text-orange-500" />
              <span>Email Support</span>
            </a>
          </div>


        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-center text-sm text-gray-400 sm:flex-row">

          <p>
            © {new Date().getFullYear()} EV Auto Parts.
            All rights reserved.
          </p>

          <p>
            Website Designed & Developed by{" "}
            <a
              href={WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-orange-500 transition hover:text-orange-400 hover:underline"
            >
              FOUR FOLD Marketing Agency
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
