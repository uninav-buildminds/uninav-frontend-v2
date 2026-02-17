import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Share08Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DemoClub } from "@/data/clubs.demo";

const PlaceholderImage = "/placeholder.svg";

interface ClubCardProps {
  club: DemoClub;
  onClick?: () => void;
  onShare?: (club: DemoClub) => void;
}

const ClubCard: React.FC<ClubCardProps> = ({ club, onClick, onShare }) => {
  const { name, description, imageUrl, tags, meta, externalLink } = club;
  const imageSrc = imageUrl || PlaceholderImage;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/dashboard/clubs/${club.slug}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch(() => {
        const ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        toast.success("Link copied to clipboard!");
      });
    onShare?.(club);
  };

  return (
    <TooltipProvider>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        className="group relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-xl"
        aria-label={`View ${name}`}
      >
        {/* Image */}
        <div className="aspect-square overflow-hidden rounded-xl mb-3 relative border border-brand/20 shadow-sm">
          <img
            src={imageSrc}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = PlaceholderImage;
            }}
          />

          {/* Tags - Bottom Left (on image) */}
          {tags && tags.length > 0 && (
            <div className="absolute bottom-2 left-2 flex flex-nowrap gap-1 overflow-hidden max-w-[calc(100%-1rem)]">
              {tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-0.5 text-xs bg-[#DCDFFE] text-brand rounded-md truncate min-w-0 flex-shrink"
                  title={tag}
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="inline-block px-2 py-0.5 text-xs bg-[#DCDFFE] text-brand rounded-md flex-shrink-0 whitespace-nowrap">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content - share bottom right like MaterialCard */}
        <div className="space-y-1 relative">
          <h4
            className="font-medium text-sm text-gray-900 leading-tight truncate pr-12"
            title={name}
          >
            {name}
          </h4>
          {meta && (
            <div className="text-xs text-gray-500 truncate pr-12">
              {meta}
            </div>
          )}
          <div className="absolute bottom-0 right-0 flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleShare}
                  className="p-1.5 text-gray-600 hover:text-brand hover:bg-[#DCDFFE] rounded-md transition-colors duration-200"
                  aria-label="Share"
                >
                  <HugeiconsIcon icon={Share08Icon} strokeWidth={1.5} size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ClubCard;
