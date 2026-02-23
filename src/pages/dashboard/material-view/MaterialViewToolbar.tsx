import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Download01Icon,
  Share08Icon,
  Bookmark01Icon,
  MaximizeScreenIcon,
  MinimizeScreenIcon,
  ArrowRight01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Material } from "@/lib/types/material.types";
import { ResourceTypeEnum, RestrictionEnum } from "@/lib/types/material.types";
import { MaterialTypeEnum } from "@/lib/types/material.types";

interface MaterialViewToolbarProps {
  onBack: () => void;
  onBookmark: () => void;
  onShare: () => void;
  onDownload: () => void;
  onToggleFullscreen: () => void;
  onOpenInfoSheet: () => void;
  isPublic: boolean;
  isBookmarked: boolean;
  isFullscreen: boolean;
  sidebarCollapsed: boolean;
  iconsExpanded: boolean;
  onIconsExpandedChange: (v: boolean) => void;
  material: Material | null;
  topOffsetClass: string;
}

const MaterialViewToolbar: React.FC<MaterialViewToolbarProps> = ({
  onBack,
  onBookmark,
  onShare,
  onDownload,
  onToggleFullscreen,
  onOpenInfoSheet,
  isPublic,
  isBookmarked,
  isFullscreen,
  sidebarCollapsed,
  iconsExpanded,
  onIconsExpandedChange,
  material,
  topOffsetClass,
}) => {
  const showDownload =
    material &&
    material.restriction !== RestrictionEnum.READONLY &&
    material.type !== MaterialTypeEnum.YOUTUBE &&
    (material.resource?.resourceType === ResourceTypeEnum.UPLOAD ||
      material.type === MaterialTypeEnum.GDRIVE ||
      material.type === MaterialTypeEnum.GUIDE);

  return (
    <>
      <button
        onClick={onBack}
        className={`fixed left-3 sm:left-4 z-50 p-2 sm:p-2.5 bg-white/90 backdrop-blur hover:bg-white border border-gray-200 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${topOffsetClass}`}
        aria-label="Go back"
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          strokeWidth={1.5}
          size={18}
          className="text-gray-700"
        />
      </button>

      <div
        className={`fixed z-50 flex items-center gap-1.5 sm:gap-2 transition-all duration-300 ${topOffsetClass} ${
          isFullscreen
            ? "right-3 sm:right-4"
            : !sidebarCollapsed
            ? "right-3 sm:right-4 md:right-[calc(288px+0.5rem)]"
            : "right-3 sm:right-4"
        }`}
      >
        <div
          className={`flex items-center gap-1.5 sm:gap-2 transition-all duration-500 ease-in-out ${
            iconsExpanded
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0 pointer-events-none"
          }`}
        >
          {!isPublic && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBookmark}
              className={`bg-white/90 backdrop-blur hover:bg-white border border-gray-200 h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full shadow-lg flex-shrink-0 ${
                isBookmarked ? "text-brand" : ""
              }`}
            >
              <HugeiconsIcon
                icon={Bookmark01Icon}
                strokeWidth={1.5}
                size={15}
                className={`sm:w-4 sm:h-4 ${isBookmarked ? "fill-current" : ""}`}
              />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="bg-white/90 backdrop-blur hover:bg-white border border-gray-200 h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full shadow-lg flex-shrink-0"
          >
            <HugeiconsIcon
              icon={Share08Icon}
              strokeWidth={1.5}
              size={15}
              className="sm:w-4 sm:h-4"
            />
          </Button>
          {showDownload && (
            <Button
              onClick={onDownload}
              size="sm"
              className="bg-brand/90 backdrop-blur text-white hover:bg-brand border-2 border-white h-8 sm:h-9 px-3 sm:px-4 rounded-full shadow-lg flex-shrink-0"
            >
              <HugeiconsIcon
                icon={Download01Icon}
                strokeWidth={1.5}
                size={15}
                className="sm:w-4 sm:h-4"
              />
            </Button>
          )}
        </div>

        <button
          onClick={onOpenInfoSheet}
          className="md:hidden flex items-center justify-center h-8 sm:h-9 w-8 sm:w-9 rounded-full bg-brand border border-white shadow-lg hover:bg-brand/90 transition-colors flex-shrink-0"
          aria-label="View material information"
          title="Material Information"
        >
          <HugeiconsIcon
            icon={InformationCircleIcon}
            strokeWidth={1.5}
            size={16}
            className="sm:w-4 sm:h-4 text-white"
          />
        </button>

        <div className="flex items-center gap-0 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-lg overflow-hidden h-8 sm:h-9">
          <button
            onClick={onToggleFullscreen}
            className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-gray-50 transition-colors flex-shrink-0"
            title={
              isFullscreen
                ? "Exit fullscreen (ESC)"
                : "Enter fullscreen (F11)"
            }
          >
            {isFullscreen ? (
              <HugeiconsIcon
                icon={MinimizeScreenIcon}
                strokeWidth={1.5}
                size={15}
                className="sm:w-4 sm:h-4"
              />
            ) : (
              <HugeiconsIcon
                icon={MaximizeScreenIcon}
                strokeWidth={1.5}
                size={15}
                className="sm:w-4 sm:h-4"
              />
            )}
          </button>
          <div
            className={`h-6 w-[1px] bg-gray-300 transition-all duration-500 ease-in-out ${
              iconsExpanded ? "opacity-100" : "opacity-0"
            }`}
          />
          <button
            onClick={() => onIconsExpandedChange(!iconsExpanded)}
            className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-gray-50 transition-colors flex-shrink-0"
            aria-label={iconsExpanded ? "Collapse icons" : "Expand icons"}
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={1.5}
              size={15}
              className={`sm:w-4 sm:h-4 transition-transform duration-300 ${
                iconsExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </>
  );
};

export default MaterialViewToolbar;
