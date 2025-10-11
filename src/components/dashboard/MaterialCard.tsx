import React from "react";
import { Share08Icon, PencilEdit02Icon, Delete02Icon } from "hugeicons-react";
import { toast } from "sonner";
import { Material } from "../../lib/types/material.types";
import { formatRelativeTime } from "../../lib/utils";
import { useBookmarks } from "../../context/bookmark/BookmarkContextProvider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Placeholder from "/placeholder.svg";

// Custom Bookmark Icons
const BookmarkOutlineIcon = ({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    width={size}
    height={size}
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
    />
  </svg>
);

const BookmarkFilledIcon = ({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width={size}
    height={size}
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
      clipRule="evenodd"
    />
  </svg>
);

interface MaterialCardProps {
  material: Material;
  onShare?: (id: string) => void;
  onRead?: (id: string) => void;
  lastViewedAt?: string; // For recent materials - shows when the user last viewed this material
  onEdit?: (material: Material) => void; // For user uploads - edit material
  onDelete?: (id: string) => void; // For user uploads - delete material
  showEditDelete?: boolean; // Show edit/delete actions instead of bookmark
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onShare,
  onRead,
  lastViewedAt,
  onEdit,
  onDelete,
  showEditDelete = false,
}) => {
  const { id, label, createdAt, downloads, tags, views, likes } = material;

  console.log("Rendering MaterialCard for material:", material);

  const previewImage = material.previewUrl;

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const saved = isBookmarked(id);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(material);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/dashboard/material/${id}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("Link copied to clipboard!");
      });
    onShare?.(id);
  };

  return (
    <TooltipProvider>
      <div className="group relative cursor-pointer" onClick={() => onRead?.(id)}>
        {/* File Preview */}
        <div className="aspect-square overflow-hidden rounded-xl mb-3 relative border border-brand/20 shadow-sm">
          <img
            src={material.previewUrl || Placeholder}
            alt={label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onLoad={() => {
              console.log(
                "Preview image loaded successfully:",
                material.previewUrl
              );
            }}
            onError={(e) => {
              console.error("Preview image failed to load:", {
                src: material.previewUrl,
                error: e,
                materialId: material.id,
              });

              // Test if URL is accessible by trying to fetch it
              if (material.previewUrl) {
                console.log("Testing URL accessibility:", material.previewUrl);
                fetch(material.previewUrl, { method: "HEAD", mode: "no-cors" })
                  .then(() => console.log("URL is accessible via fetch"))
                  .catch((err) => console.error("URL fetch failed:", err));
              }

              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />

        {/* Action Buttons - Top Right */}
        {showEditDelete ? (
          // Edit/Delete buttons for user uploads
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={handleEdit}
              className="p-1 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-brand hover:bg-[#DCDFFE] rounded-md transition-colors duration-200 shadow-sm"
              aria-label="Edit material"
            >
              <PencilEdit02Icon size={18} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 shadow-sm"
              aria-label="Delete material"
            >
              <Delete02Icon size={18} />
            </button>
          </div>
        ) : (
          // Bookmark button for other materials
          <button
            onClick={handleSave}
            className="absolute top-2 right-2 p-1 text-gray-600 hover:text-brand bg-[#DCDFFE] rounded-md transition-colors duration-200"
            aria-label={saved ? "Remove from saved" : "Save material"}
          >
            {saved ? (
              <BookmarkFilledIcon size={20} className="text-brand" />
            ) : (
              <BookmarkOutlineIcon size={20} />
            )}
          </button>
        )}

        {/* Tags - Bottom Left */}
        {tags && tags.length > 0 && (
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-0.5 text-xs bg-[#DCDFFE] text-brand rounded-md"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="inline-block px-2 py-0.5 text-xs bg-[#DCDFFE] text-brand rounded-md">
                +{tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1">
        {/* Name */}
        <Tooltip>
          <TooltipTrigger asChild>
            <h4
              className="font-medium text-sm text-gray-900 leading-tight truncate"
              title={label}
            >
              {label}
            </h4>
          </TooltipTrigger>
          <TooltipContent>
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>

        {/* Metadata and Action Icons */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 truncate flex-1">
            {lastViewedAt
              ? `Viewed ${formatRelativeTime(lastViewedAt)}`
              : `${formatRelativeTime(
                  createdAt
                )} • ${views} views • ${likes} likes`}
          </div>

          {/* Action Icons - Share only */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={handleShare}
              className="p-1 text-gray-600 hover:text-brand hover:bg-[#DCDFFE] rounded-md transition-colors duration-200"
              aria-label="Share"
            >
              <Share08Icon size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
};

export default MaterialCard;
