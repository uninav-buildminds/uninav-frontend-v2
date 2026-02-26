import React from "react";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRightDoubleIcon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Material } from "@/lib/types/material.types";
import MaterialMetadataBlock from "./MaterialMetadataBlock";
import AdCarousel from "./AdCarousel";

interface MaterialSidebarProps {
  material: Material;
  relatedMaterials: Material[];
  sidebarCollapsed: boolean;
  onCollapse: () => void;
  onFlag: () => void;
  onLike: () => void;
  onDislike: () => void;
}

const MaterialSidebar: React.FC<MaterialSidebarProps> = ({
  material,
  relatedMaterials,
  sidebarCollapsed,
  onCollapse,
  onFlag,
  onLike,
  onDislike,
}) => {
  const navigate = useNavigate();

  const handleCreatorClick = () => {
    if (material.creator?.id) {
      navigate(`/dashboard/profile/${material.creator.id}`);
    }
  };

  return (
    <div
      className={`relative bg-white rounded-lg sm:rounded-xl border border-gray-200 flex-col transition-all duration-300 shadow-sm hidden md:flex ${
        sidebarCollapsed ? "w-0 border-0 overflow-hidden" : "w-64 sm:w-72"
      }`}
    >
      {!sidebarCollapsed && (
        <button
          onClick={onCollapse}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 p-2 rounded-full bg-brand text-white shadow-md hover:opacity-90"
          aria-label="Collapse side panel"
        >
          <HugeiconsIcon
            icon={ArrowRightDoubleIcon}
            strokeWidth={1.5}
            size={18}
          />
        </button>
      )}

      <div className="p-3 border-b border-gray-200">
        <h1 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
          {material.label}
        </h1>
        {material.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {material.description}
          </p>
        )}

        {material.tags && material.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {material.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs py-0 px-1.5"
              >
                {tag}
              </Badge>
            ))}
            {material.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs py-0 px-1.5">
                +{material.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-1 text-xs">
          <MaterialMetadataBlock
            material={material}
            onCreatorClick={handleCreatorClick}
            onFlag={onFlag}
            onLike={onLike}
            onDislike={onDislike}
            variant="compact"
          />
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto">
        <AdCarousel variant="compact" title="For you" />
      </div>
    </div>
  );
};

export default MaterialSidebar;
