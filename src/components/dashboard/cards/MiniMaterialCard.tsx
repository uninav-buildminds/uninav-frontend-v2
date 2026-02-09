import React from "react";
import { Material } from "@/lib/types/material.types";
import Placeholder from "/placeholder.svg";

interface MiniMaterialCardProps {
  material: Material;
  onClick: () => void;
}

// Mini material card for sidebar with 2-column grid layout
const MiniMaterialCard: React.FC<MiniMaterialCardProps> = ({
  material,
  onClick,
}) => {
  const { label, previewUrl, targetCourse } = material;

  return (
    <div
      className="group relative cursor-pointer bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-brand/30 transition-all duration-200 overflow-hidden"
      onClick={onClick}
    >
      <div className="flex flex-col">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
          <img
            src={previewUrl || Placeholder}
            alt={label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = Placeholder;
            }}
          />
          {/* Course Code Badge */}
          {targetCourse && (
            <div className="absolute top-1 left-1">
              <span className="inline-block px-1.5 py-0.5 text-[9px] font-medium bg-brand/90 text-white rounded">
                {targetCourse.courseCode}
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="p-1.5">
          <h4 className="font-medium text-[10px] text-gray-900 leading-tight line-clamp-2">
            {label}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default MiniMaterialCard;
