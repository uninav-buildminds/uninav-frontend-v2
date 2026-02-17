import React, { useState, useRef, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Share08Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { DemoClub } from "@/data/clubs.demo";

const PlaceholderImage = "/placeholder.svg";

/** Slice to max 3 images; fallback to placeholder */
function getCarouselImages(club: DemoClub): string[] {
  const urls = club.imageUrls?.length
    ? club.imageUrls.slice(0, 3)
    : club.imageUrl
      ? [club.imageUrl]
      : [];
  if (urls.length === 0) return [PlaceholderImage];
  return urls.map((u) => u || PlaceholderImage);
}

interface ClubDetailViewProps {
  club: DemoClub;
  onJoinNow?: (club: DemoClub) => void;
  onShare?: (club: DemoClub) => void;
  /** When true, buttons are rendered outside (e.g. sheet footer); only content is rendered here */
  buttonsInFooter?: boolean;
}

/** Actions (Join Now + Share) for use in sheet footer so they stay visible */
export function ClubDetailFooter({
  club,
  onJoinNow,
  onShare,
}: Pick<ClubDetailViewProps, "club" | "onJoinNow" | "onShare">) {
  const handleJoinNow = () => {
    if (club.externalLink) {
      window.open(club.externalLink, "_blank", "noopener,noreferrer");
      onJoinNow?.(club);
    } else {
      toast.error("No link available");
    }
  };
  const handleShare = () => {
    const url = `${window.location.origin}/dashboard/clubs/${club.slug}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copied to clipboard!"),
      () => {
        const ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        toast.success("Link copied to clipboard!");
      }
    );
    onShare?.(club);
  };
  return (
    <div className="flex gap-2 pt-4 border-t border-gray-100 flex-shrink-0">
      <Button
        onClick={handleJoinNow}
        className="flex-1 bg-brand hover:bg-brand/90 text-white"
      >
        Join Now
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleShare}
        aria-label="Share"
      >
        <HugeiconsIcon icon={Share08Icon} strokeWidth={1.5} size={18} />
      </Button>
    </div>
  );
}

/** Shared content for club detail modal (desktop) and bottom sheet (mobile). */
const ClubDetailView: React.FC<ClubDetailViewProps> = ({
  club,
  onJoinNow,
  onShare,
  buttonsInFooter = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const images = getCarouselImages(club);
  const { name, description, tags, meta, department, externalLink } = club;

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const width = el.clientWidth;
    el.scrollTo({ left: index * width, behavior: "smooth" });
    setCurrentIndex(index);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const width = el.clientWidth;
    const newIndex = Math.round(el.scrollLeft / width);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
      setCurrentIndex(newIndex);
    }
  };

  const handleJoinNow = () => {
    if (externalLink) {
      window.open(externalLink, "_blank", "noopener,noreferrer");
      onJoinNow?.(club);
    } else {
      toast.error("No link available");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/dashboard/clubs/${club.slug}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copied to clipboard!"),
      () => {
        const ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        toast.success("Link copied to clipboard!");
      }
    );
    onShare?.(club);
  };

  const buttonBlock = (
    <div className="flex gap-2 pt-4 mt-6 sm:mt-8 border-t border-gray-100 flex-shrink-0">
      <Button
        onClick={handleJoinNow}
        className="flex-1 bg-brand hover:bg-brand/90 text-white"
      >
        Join Now
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleShare}
        aria-label="Share"
      >
        <HugeiconsIcon icon={Share08Icon} strokeWidth={1.5} size={18} />
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col min-h-0">
      {/* Carousel: max 3 images, rounded edges, swiper dots */}
      <div className="flex-shrink-0 overflow-hidden rounded-xl">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-full snap-center aspect-video bg-gray-100 overflow-hidden rounded-xl"
              style={{ scrollSnapAlign: "center" }}
            >
              <img
                src={src}
                alt={`${name} ${i + 1}`}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PlaceholderImage;
                }}
              />
            </div>
          ))}
        </div>
        {/* Swiper dots (like MetricCard) */}
        <div className="flex justify-center gap-2 py-3">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollToIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-brand w-6" : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
        {(meta || department) && (
          <p className="text-sm text-gray-500 mt-0.5">
            {[meta, department].filter(Boolean).join(" • ")}
          </p>
        )}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="inline-block px-2 py-0.5 text-xs bg-[#DCDFFE] text-brand rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-600 mt-3 flex-1">{description}</p>

        {!buttonsInFooter && buttonBlock}
      </div>
    </div>
  );
};

export default ClubDetailView;
