import React from "react";
import { Material } from "@/lib/types/material.types";
import { formatRelativeTime } from "@/lib/utils";
import Placeholder from "/placeholder.svg";

interface CompactMaterialCardProps {
  material: Material;
  onClick: () => void;
}

// Compact material card for sidebar/related materials section
const CompactMaterialCard: React.FC<CompactMaterialCardProps> = ({
  material,
  onClick,
}) => {
  const { label, createdAt, views, previewUrl, tags } = material;

  return (
    <div
      className="group relative cursor-pointer bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-brand/30 transition-all duration-200 overflow-hidden"
      onClick={onClick}
    >
      <div className="flex gap-2 p-2">
        {/* Thumbnail */}
        <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100">
          <img
            src={previewUrl || Placeholder}
            alt={label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = Placeholder;
            }}
          />
          {/* Tag badge if available */}
          {tags && tags.length > 0 && (
            <div className="absolute bottom-0.5 left-0.5 right-0.5">
              <span className="inline-block px-1 py-0.5 text-[9px] bg-brand/90 text-white rounded truncate max-w-full">
                {tags[0]}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Title */}
          <h4 className="font-medium text-xs text-gray-900 leading-tight line-clamp-2 mb-0.5">
            {label}
          </h4>

          {/* Metadata */}
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span className="truncate">{views} views</span>
            <span>•</span>
            <span className="truncate">{formatRelativeTime(createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactMaterialCard;



