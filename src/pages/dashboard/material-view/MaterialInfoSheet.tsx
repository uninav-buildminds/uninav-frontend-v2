import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Material } from "@/lib/types/material.types";
import MaterialMetadataBlock from "./MaterialMetadataBlock";
import AdCarousel from "./AdCarousel";

interface MaterialInfoSheetProps {
  material: Material;
  relatedMaterials: Material[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlag: () => void;
  onLike: () => void;
  onDislike: () => void;
}

const MaterialInfoSheet: React.FC<MaterialInfoSheetProps> = ({
  material,
  relatedMaterials,
  open,
  onOpenChange,
  onFlag,
  onLike,
  onDislike,
}) => {
  const navigate = useNavigate();

  const handleCreatorClick = () => {
    if (material.creator?.id) {
      navigate(`/dashboard/profile/${material.creator.id}`);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[75vh] overflow-y-auto rounded-t-2xl"
      >
        <SheetHeader>
          <SheetTitle>Material Information</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="pb-4 border-b border-gray-200">
            <h1 className="text-base font-semibold text-gray-900 mb-2">
              {material.label}
            </h1>
            {material.description && (
              <p className="text-sm text-gray-600 mb-3">
                {material.description}
              </p>
            )}

            {material.tags && material.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {material.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs py-1 px-2"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="space-y-2 text-sm">
              <MaterialMetadataBlock
                material={material}
                onCreatorClick={handleCreatorClick}
                onFlag={onFlag}
                onLike={onLike}
                onDislike={onDislike}
                variant="normal"
              />
            </div>
          </div>

          <AdCarousel variant="normal" title="For you" />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MaterialInfoSheet;
