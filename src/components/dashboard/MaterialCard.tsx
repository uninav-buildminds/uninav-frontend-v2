import React from "react";
import { Download01Icon, Share08Icon } from "hugeicons-react";
import { toast } from "sonner";
import { Material } from "../../lib/types/material.types";
import { formatRelativeTime } from "../../lib/utils";
import { useBookmarks } from "../../context/bookmark/BookmarkContextProvider";

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
  onDownload?: (id: string) => void;
  onShare?: (id: string) => void;
  onRead?: (id: string) => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onDownload,
  onShare,
  onRead,
}) => {
  const { id, label, createdAt, downloads, tags, views, likes } = material;
  const previewImage = material.resourceAddress || "/placeholder.svg";
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const saved = isBookmarked(id);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(id);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Download started!");
    onDownload?.(id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/material/${id}`;
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
    <div className="group relative cursor-pointer" onClick={() => onRead?.(id)}>
      {/* File Preview */}
      <div className="aspect-square overflow-hidden rounded-xl mb-3 relative">
        <img
          src={previewImage}
          alt={label}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />

        {/* Save Button - Top Right */}
        <button
          onClick={handleSave}
          className="absolute top-2 right-2 p-1 text-gray-600 hover:text-brand hover:bg-[#DCDFFE] rounded-md transition-colors duration-200"
          aria-label={saved ? "Remove from saved" : "Save material"}
        >
          {saved ? (
            <BookmarkFilledIcon size={20} className="text-brand" />
          ) : (
            <BookmarkOutlineIcon size={20} />
          )}
        </button>

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
            {tags.length > 2 && (
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
        <h4
          className="font-medium text-sm text-gray-900 leading-tight overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {label}
        </h4>

        {/* Metadata and Action Icons */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 truncate flex-1">
            {formatRelativeTime(createdAt)} • {views} views • {likes} likes
          </div>

          {/* Action Icons - Download and Share */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={handleDownload}
              className="p-1 text-gray-600 hover:text-brand hover:bg-[#DCDFFE] rounded-md transition-colors duration-200"
              aria-label="Download"
            >
              <Download01Icon size={16} />
            </button>

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
  );
};

export default MaterialCard;
