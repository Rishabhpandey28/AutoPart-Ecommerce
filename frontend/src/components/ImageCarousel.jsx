import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Cog, ChevronLeft, ChevronRight } from "lucide-react";

// All images of a product (falls back to the old single `image` field)
export const getImages = (p) =>
  p.images?.length ? p.images : p.image ? [p.image] : [];

const FIT = {
  cover: "object-cover",
  contain: "object-contain p-2",
  // contain on mobile list cards, cover on bigger grid cards
  card: "object-contain p-2 sm:object-cover sm:p-0",
};

/*
  Swipeable image slider (native scroll-snap: swipe on phones,
  arrows on desktop, dots everywhere).
  Fills its parent, so the parent must be `relative` with a size.
  - to:       optional link, each slide becomes a link to that page
  - active /
    onChange: optional, lets a parent (thumbnails) control the slide
*/
export default function ImageCarousel({
  images,
  alt = "",
  to,
  fit = "cover",
  active,
  onChange,
  dotsClass = "bottom-2",
}) {
  const ref = useRef(null);
  const [idx, setIdx] = useState(0);
  const count = images.length;

  const goTo = (i) => {
    const el = ref.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const handleScroll = () => {
    const el = ref.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== idx) {
      setIdx(i);
      onChange?.(i);
    }
  };

  useEffect(() => {
    if (active !== undefined && active !== idx) goTo(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (count === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Cog size={56} className="text-gray-300" />
      </div>
    );
  }

  const slideImg = (src, i) => (
    <img
      src={src}
      alt={alt}
      draggable={false}
      loading={i === 0 ? "eager" : "lazy"}
      className={`h-full w-full ${FIT[fit]}`}
    />
  );

  return (
    <>
      <div
        ref={ref}
        onScroll={handleScroll}
        className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) =>
          to ? (
            <Link
              key={src + i}
              to={to}
              className="h-full w-full shrink-0 snap-center snap-always"
            >
              {slideImg(src, i)}
            </Link>
          ) : (
            <div
              key={src + i}
              className="h-full w-full shrink-0 snap-center snap-always"
            >
              {slideImg(src, i)}
            </div>
          )
        )}
      </div>

      {count > 1 && (
        <>
          {/* Arrows (desktop, on hover) */}
          {idx > 0 && (
            <button
              type="button"
              onClick={() => goTo(idx - 1)}
              aria-label="Previous image"
              className="absolute left-1.5 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-1 text-gray-700 opacity-0 shadow transition hover:bg-orange-500 hover:text-white group-hover:opacity-100 sm:flex"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {idx < count - 1 && (
            <button
              type="button"
              onClick={() => goTo(idx + 1)}
              aria-label="Next image"
              className="absolute right-1.5 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-1 text-gray-700 opacity-0 shadow transition hover:bg-orange-500 hover:text-white group-hover:opacity-100 sm:flex"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Dots */}
          <div
            className={`pointer-events-none absolute inset-x-0 flex justify-center gap-1.5 ${dotsClass}`}
          >
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`pointer-events-auto h-1.5 rounded-full transition-all ${
                  i === idx ? "w-4 bg-orange-500" : "w-1.5 bg-gray-400/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}