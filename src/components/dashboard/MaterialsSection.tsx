import React, { useEffect, useRef, useState } from "react";
import { ArrowRight01Icon, SortingAZ02Icon, ArrowLeft01Icon } from "hugeicons-react";
import MaterialCard from "./MaterialCard";

interface Material {
  id: string;
  name: string;
  uploadTime: string;
  downloads: number;
  previewImage: string;
  pages?: number;
}

interface MaterialsSectionProps {
  title: string;
  materials: Material[];
  onViewAll?: () => void;
  onFilter?: () => void;
  onDownload?: (id: string) => void;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  onRead?: (id: string) => void;
  scrollStep?: number;
}

const MaterialsSection: React.FC<MaterialsSectionProps> = ({
  title,
  materials,
  onViewAll,
  onFilter,
  onDownload,
  onSave,
  onShare,
  onRead,
  scrollStep = 240,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    updateScrollButtons();
    const onResize = () => updateScrollButtons();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scrollByAmount = (amount: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-3">
          {/* Filter Button */}
          <button
            onClick={onFilter}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Filter materials"
          >
            <SortingAZ02Icon size={18} className="text-gray-600" />
          </button>

          {/* View All Button */}
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            View All
            <ArrowRight01Icon size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Materials rail */}
      <div className="relative">
        {/* Soft gradient edges (only when scrolling is possible) */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white/95 via-white/70 to-transparent z-10" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/95 via-white/70 to-transparent z-10" />
        )}

        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scrollByAmount(-scrollStep)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/90 backdrop-blur rounded-full shadow-md border border-gray-200 hover:bg-white"
            aria-label="Scroll left"
          >
            <ArrowLeft01Icon size={16} className="text-brand" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scrollByAmount(scrollStep)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/90 backdrop-blur rounded-full shadow-md border border-gray-200 hover:bg-white"
            aria-label="Scroll right"
          >
            <ArrowRight01Icon size={16} className="text-brand" />
          </button>
        )}

        {/* Scroll container */}
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollButtons}
          className="flex gap-6 overflow-x-auto overflow-y-visible pb-2 scrollbar-hide"
        >
          {materials.map((material) => (
            <div 
              key={material.id} 
              className="flex-shrink-0 w-64 sm:w-72 md:w-80 lg:w-72 xl:w-64 2xl:w-72"
            >
              <MaterialCard
                {...material}
                onDownload={onDownload}
                onSave={onSave}
                onShare={onShare}
                onRead={onRead}
              />
            </div>
          ))}
          {/* Add padding to the last item to ensure proper spacing */}
          <div className="flex-shrink-0 w-6" />
        </div>
      </div>
    </section>
  );
};

export default MaterialsSection;
