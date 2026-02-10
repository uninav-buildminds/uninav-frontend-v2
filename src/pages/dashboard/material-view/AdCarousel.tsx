import React, { useState, useRef, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

const AD_SLIDES = [
  { id: "1", image: "/placeholder.svg", alt: "Ad 1" },
  { id: "2", image: "/placeholder.svg", alt: "Ad 2" },
  { id: "3", image: "/placeholder.svg", alt: "Ad 3" },
];

interface AdCarouselProps {
  /** compact = sidebar (smaller, with arrows on desktop), normal = sheet (larger images, gap between) */
  variant?: "compact" | "normal";
  title?: string;
}

/**
 * Swipeable ad carousel with dots. Full-width slides; scroll step = clientWidth.
 */
const AdCarousel: React.FC<AdCarouselProps> = ({
  variant = "normal",
  title = "For you",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isCompact = variant === "compact";

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.clientWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    const clamped = Math.min(Math.max(0, newIndex), AD_SLIDES.length - 1);
    setCurrentIndex((prev) => (prev !== clamped ? clamped : prev));
  }, []);

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const cardWidth = container.clientWidth;
    container.scrollTo({ left: index * cardWidth, behavior: "smooth" });
    setCurrentIndex(index);
  };

  const goPrev = () => scrollToIndex(Math.max(0, currentIndex - 1));
  const goNext = () => scrollToIndex(Math.min(AD_SLIDES.length - 1, currentIndex + 1));

  return (
    <div className={isCompact ? "space-y-2" : "pt-4 space-y-3"}>
      {title && (
        <h3
          className={cn(
            "font-semibold text-gray-900",
            isCompact ? "text-xs" : "text-sm"
          )}
        >
          {title}
        </h3>
      )}
      <div className="relative">
        {/* Arrows - desktop only for compact (sidebar) */}
        {isCompact && (
          <>
            <button
              type="button"
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/90 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Previous slide"
              style={{ marginRight: "8px" }}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} size={14} />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={currentIndex === AD_SLIDES.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/90 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Next slide"
              style={{ marginLeft: "8px" }}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.5} size={14} />
            </button>
          </>
        )}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={cn(
            "flex overflow-x-auto scrollbar-hide snap-x snap-mandatory",
            !isCompact && "gap-3 px-3"
          )}
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {AD_SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="flex-shrink-0 w-full snap-center"
              style={{ scrollSnapAlign: "center" }}
            >
              <div
                className={cn(
                  "rounded-xl overflow-hidden bg-gray-100",
                  isCompact ? "mx-0.5 h-[320px]" : "mx-0"
                )}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className={cn(
                    "w-full object-cover",
                    isCompact ? "h-full w-full" : "aspect-[3/2] min-h-[240px]"
                  )}
                />
              </div>
            </div>
          ))}
        </div>
        {/* Swiper dots */}
        <div className={cn("flex justify-center gap-2", isCompact ? "mt-2" : "mt-3")}>
          {AD_SLIDES.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollToIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-brand w-6"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdCarousel;
export { AD_SLIDES };
