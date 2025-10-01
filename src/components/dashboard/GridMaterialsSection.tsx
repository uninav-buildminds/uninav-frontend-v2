import Pic from "../../../public/placeholder.svg";
import { Material } from "../../lib/types/material.types";
import { MaterialWithLastViewed } from "./MaterialsSection";

import React, { useEffect, useState, useMemo } from "react";
import { ArrowRight01Icon, SortingAZ02Icon } from "hugeicons-react";
import MaterialCard from "./MaterialCard";
import EmptyState from "./EmptyState";
import { motion, AnimatePresence } from "framer-motion";

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

type GridMaterialsSectionProps = {
  title: string;
  materials: Material[] | MaterialWithLastViewed[] | (() => Promise<any>);
  onViewAll?: () => void;
  onFilter?: () => void;
  onDownload?: (id: string) => void;
  onShare?: (id: string) => void;
  onRead?: (id: string) => void;
  showViewAll?: boolean;
  emptyStateType?:
    | "recent"
    | "recommendations"
    | "libraries"
    | "saved"
    | "uploads";
  onEmptyStateAction?: () => void;
  isLoading?: boolean;
};

const GridMaterialsSection: React.FC<GridMaterialsSectionProps> = ({
  title,
  materials,
  onViewAll,
  onFilter,
  onDownload,
  onShare,
  onRead,
  showViewAll = true,
  emptyStateType,
  onEmptyStateAction,
  isLoading = false,
}) => {
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
  const sortedMaterials = useMemo(() => {
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
  }, [displayMaterials, sortBy]);

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
    // Don't show empty state for recommendations
    if (!emptyStateType) {
      return <div>{""}</div>;
    }

    return (
      <section className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-3">
            {/* Sort Button with Dropdown */}
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
          {/* Sort Button with Dropdown */}
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

      {/* Materials grid - 2 cards on mobile, 6 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
        {sortedMaterials.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            onDownload={onDownload}
            onShare={onShare}
            onRead={onRead}
            lastViewedAt={material.lastViewedAt}
          />
        ))}
      </div>
    </section>
  );
};

export default GridMaterialsSection;
