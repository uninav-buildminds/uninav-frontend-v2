import Pic from "../../../public/placeholder.svg";
import { Material } from "../../lib/types/material.types";
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  ArrowRight01Icon,
  SortingAZ02Icon,
  ArrowLeft01Icon,
} from "hugeicons-react";
import MaterialCard from "./MaterialCard";
import EmptyState from "./EmptyState";
import { motion, AnimatePresence } from "framer-motion";

// Extended Material type for recent materials that includes lastViewedAt
export interface MaterialWithLastViewed extends Material {
  lastViewedAt?: string;
}

export interface MaterialRecommendation {
  id: string;
  type: string;
  tags: string[] | null;
  views: number;
  downloads: number;
  likes: number;
  creatorId: string;
  label: string;
  description: string;
  visibility: string;
  restriction: string;
  targetCourseId: string;
  reviewStatus: string;
  reviewedById: string;
  previewUrl: string | null;
  metaData: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    profilePicture?: string;
  };
  targetCourse: {
    id: string;
    courseName: string;
    courseCode: string;
  };
}

export interface MaterialRecommendationsResponse {
  message: string;
  status: string;
  data: {
    items: MaterialRecommendation[];
    pagination: {
      total: number;
      page: number | null;
      pageSize: number;
      totalPages: number;
      hasMore: boolean;
      hasPrev: boolean;
    };
  };
}

// Adapter to map API MaterialRecommendation to Material type
export function mapRecommendationToMaterial(
  rec: MaterialRecommendation
): Material {
  return {
    id: rec.id,
    label: rec.label,
    description: rec.description,
    type: rec.type as any, // MaterialTypeEnum
    tags: rec.tags || [],
    visibility: rec.visibility as any, // VisibilityEnum
    restriction: rec.restriction as any, // RestrictionEnum
    targetCourseId: rec.targetCourseId,
    previewUrl: rec.previewUrl || undefined,
    likes: rec.likes,
    downloads: rec.downloads,
    views: rec.views,
    reviewStatus: rec.reviewStatus as any, // ApprovalStatusEnum
    creator: rec.creator,
    targetCourse: rec.targetCourse
      ? {
          ...rec.targetCourse,
          reviewStatus: "approved" as any, // Default to approved for displayed materials
          createdAt: rec.createdAt,
          updatedAt: rec.updatedAt,
        }
      : undefined,
    createdAt: rec.createdAt,
    updatedAt: rec.updatedAt,
  };
}

type MaterialsSectionProps = {
  title: string;
  materials: Material[] | MaterialWithLastViewed[] | (() => Promise<any>);
  onViewAll?: () => void;
  onFilter?: () => void;
  onShare?: (id: string) => void;
  onRead?: (id: string) => void;
  scrollStep?: number;
  showViewAll?: boolean;
  emptyStateType?:
    | "recent"
    | "recommendations"
    | "libraries"
    | "saved"
    | "uploads";
  onEmptyStateAction?: () => void;
  isLoading?: boolean;
  layout?: "rail" | "grid"; // rail = horizontal scroll, grid = 2-row grid
  onEdit?: (material: Material) => void; // For user uploads - edit material
  onDelete?: (id: string) => void; // For user uploads - delete material
  showEditDelete?: boolean; // Show edit/delete actions on cards
  preserveOrder?: boolean; // If true, materials are displayed in the order received (no custom sorting)
};

const MaterialsSection: React.FC<MaterialsSectionProps> = ({
  title,
  materials,
  onViewAll,
  onFilter,
  onShare,
  onRead,
  scrollStep = 240,
  showViewAll = true,
  emptyStateType = "recent",
  onEmptyStateAction,
  isLoading = false,
  layout = "rail",
  onEdit,
  onDelete,
  showEditDelete = false,
  preserveOrder = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "date" | "downloads">("date");
  const [fetchedMaterials, setFetchedMaterials] = useState<Material[] | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If materials is a function (async fetch), call it and set state
  useEffect(() => {
    if (typeof materials === "function") {
      setLoading(true);
      setError(null);
      Promise.resolve(materials())
        .then((result: any) => {
          // Try to handle both direct array and API response
          if (Array.isArray(result)) {
            setFetchedMaterials(result);
          } else if (result?.data?.items) {
            // If API response, map to Material[]
            setFetchedMaterials(
              result.data.items.map(mapRecommendationToMaterial)
            );
          } else {
            setFetchedMaterials([]);
          }
        })
        .catch((err) => {
          setError("Failed to fetch materials");
          setFetchedMaterials([]);
        })
        .finally(() => setLoading(false));
    } else {
      setFetchedMaterials(null);
    }
  }, [materials]);

  // Use fetchedMaterials if present, else use props.materials

  const updateScrollButtons = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  // Memoize displayMaterials to avoid recalculating on every render
  const displayMaterials: MaterialWithLastViewed[] = useMemo(() => {
    const mats =
      fetchedMaterials !== null
        ? fetchedMaterials
        : Array.isArray(materials)
        ? materials
        : [];
    return mats;
  }, [fetchedMaterials, materials]);

  // Memoize sortedMaterials based on displayMaterials and sortBy
  // If preserveOrder is true, skip custom sorting and return materials as-is
  const sortedMaterials = useMemo(() => {
    if (preserveOrder) {
      return displayMaterials;
    }
    return [...displayMaterials].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.label.localeCompare(b.label);
        case "date": {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        case "downloads":
          return b.downloads - a.downloads;
        default:
          return 0;
      }
    });
  }, [displayMaterials, sortBy, preserveOrder]);

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

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSortOptions &&
        !(event.target as Element).closest(".sort-dropdown")
      ) {
        setShowSortOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSortOptions]);

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500">Loading materials...</div>
    );
  }
  if (error) {
    return <div className="py-8 text-center text-red-500">{error}</div>;
  }
  if (!sortedMaterials || sortedMaterials.length === 0) {
    return (
      <section className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-3">
            {/* Sort Button with Dropdown - Hide when order is preserved */}
            {!preserveOrder && (
              <div className="relative sort-dropdown">
                <button
                  onClick={() => setShowSortOptions(!showSortOptions)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Sort materials"
                >
                  <SortingAZ02Icon size={18} className="text-gray-600" />
                </button>

                {/* Sort Options Dropdown */}
                <AnimatePresence>
                  {showSortOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-dropdown"
                    >
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setSortBy("name");
                            setShowSortOptions(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                            sortBy === "name"
                              ? "text-brand bg-brand/5"
                              : "text-gray-700"
                          }`}
                        >
                          Sort by Name (A-Z)
                        </button>
                        <button
                          onClick={() => {
                            setSortBy("date");
                            setShowSortOptions(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                            sortBy === "date"
                              ? "text-brand bg-brand/5"
                              : "text-gray-700"
                          }`}
                        >
                          Sort by Date (Newest)
                        </button>
                        <button
                          onClick={() => {
                            setSortBy("downloads");
                            setShowSortOptions(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                            sortBy === "downloads"
                              ? "text-brand bg-brand/5"
                              : "text-gray-700"
                          }`}
                        >
                          Sort by Downloads (Most)
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* View All Button */}
            {showViewAll && (
              <button
                onClick={onViewAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                View All
                <ArrowRight01Icon size={16} className="text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        <EmptyState
          type={emptyStateType}
          onAction={onEmptyStateAction}
          isLoading={isLoading}
        />
      </section>
    );
  }
  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-3">
          {/* Sort Button with Dropdown - Hide when order is preserved */}
          {!preserveOrder && (
            <div className="relative sort-dropdown">
              <button
                onClick={() => setShowSortOptions(!showSortOptions)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-label="Sort materials"
              >
                <SortingAZ02Icon size={18} className="text-gray-600" />
              </button>

              {/* Sort Options Dropdown */}
              <AnimatePresence>
                {showSortOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-dropdown"
                  >
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setSortBy("name");
                          setShowSortOptions(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                          sortBy === "name"
                            ? "text-brand bg-brand/5"
                            : "text-gray-700"
                        }`}
                      >
                        Sort by Name (A-Z)
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("date");
                          setShowSortOptions(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                          sortBy === "date"
                            ? "text-brand bg-brand/5"
                            : "text-gray-700"
                        }`}
                      >
                        Sort by Date (Newest)
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("downloads");
                          setShowSortOptions(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                          sortBy === "downloads"
                            ? "text-brand bg-brand/5"
                            : "text-gray-700"
                        }`}
                      >
                        Sort by Downloads (Most)
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* View All Button */}
          {showViewAll && (
            <button
              onClick={onViewAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              View All
              <ArrowRight01Icon size={16} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Materials display - either rail (horizontal scroll) or grid (2 rows) */}
      {layout === "grid" ? (
        // Grid layout - 2 rows with responsive columns
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 grid-rows-2">
          {sortedMaterials.slice(0, 12).map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onShare={onShare}
              onRead={onRead}
              lastViewedAt={material.lastViewedAt}
              onEdit={onEdit}
              onDelete={onDelete}
              showEditDelete={showEditDelete}
            />
          ))}
        </div>
      ) : (
        // Rail layout - horizontal scroll
        <div className="relative">
          {/* Soft gradient edges (only when scrolling is possible) */}
          {canScrollLeft && (
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white/95 via-white/70 to-transparent z-sticky" />
          )}
          {canScrollRight && (
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/95 via-white/70 to-transparent z-sticky" />
          )}

          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scrollByAmount(-scrollStep)}
              className="absolute -left-1 top-1/2 -translate-y-1/2 z-modal p-2 bg-white/90 backdrop-blur rounded-full shadow-md border border-gray-200 hover:bg-white"
              aria-label="Scroll left"
            >
              <ArrowLeft01Icon size={16} className="text-brand" />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scrollByAmount(scrollStep)}
              className="absolute -right-1 top-1/2 -translate-y-1/2 z-modal p-2 bg-white/90 backdrop-blur rounded-full shadow-md border border-gray-200 hover:bg-white"
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
            {sortedMaterials.map((material) => (
              <div
                key={material.id}
                className="flex-shrink-0 w-48 sm:w-72 md:w-80 lg:w-72 xl:w-64"
              >
                <MaterialCard
                  material={material}
                  onShare={onShare}
                  onRead={onRead}
                  lastViewedAt={material.lastViewedAt}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  showEditDelete={showEditDelete}
                />
              </div>
            ))}
            {/* Add padding to the last item to ensure proper spacing */}
            <div className="flex-shrink-0 w-6" />
          </div>
        </div>
      )}
    </section>
  );
};

export default MaterialsSection;
