import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import MaterialCard from "./MaterialCard";
import MaterialCardSkeleton from "./MaterialCardSkeleton";
import { Material } from "@/lib/types/material.types";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, UploadSquare01Icon } from "@hugeicons/core-free-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { searchMaterials } from "@/api/materials.api";
import { SearchResult } from "@/lib/types/search.types";
import { useInView } from "react-intersection-observer";

interface SearchResultsProps {
  query: string;
  results: SearchResult<Material>;
  isSearching: boolean;
  metadata: {
    total: number;
    page: number;
    totalPages: number;
    usedAdvanced: boolean;
    isAdvancedSearch?: boolean;
  } | null;
  onShare?: (id: string) => void;
  onRead?: (slug: string) => void;
  onClearSearch: () => void;
  onUpload?: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  isSearching,
  metadata,
  onShare,
  onRead,
  onClearSearch,
  onUpload,
}) => {
  // Track all material IDs to avoid duplicates
  const allMaterialIdsRef = useRef<string[]>([]);

  const { entry, ref: infiniteScrollTriggerRef } = useInView({
    threshold: 0.25,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["search", query],
      queryFn: async ({ pageParam = 1 }) => {
        // Only include excludeIds if we have actual IDs to exclude
        const excludeIds =
          pageParam > 1 && allMaterialIdsRef.current.length > 0
            ? allMaterialIdsRef.current
            : undefined;

        const searchParams: any = {
          query: query.trim(),
          page: pageParam,
          saveHistory: true, // Save actual user searches to history
        };

        // Only add excludeIds if it has valid values
        if (excludeIds && excludeIds.length > 0) {
          searchParams.excludeIds = excludeIds;
        }

        const response = await searchMaterials(searchParams);

        // Update the material IDs ref with new materials
        if (response.data?.items) {
          response.data.items.forEach((material: Material) => {
            if (!allMaterialIdsRef.current.includes(material.id)) {
              allMaterialIdsRef.current.push(material.id);
            }
          });
        }

        return response.data;
      },
      initialPageParam: results.pagination.page,
      initialData: { pages: [results], pageParams: [results.pagination.page] },
      getNextPageParam: (lastPage, allPages) => {
        // Continue if there are more pages
        if (lastPage.pagination.hasMore) {
          return lastPage.pagination.page + 1;
        }

        // Seamless advanced search trigger:
        // If we're on first page with results but haven't used advanced search yet,
        // and we got less than a full page OR exactly a full page,
        // try one more fetch with excludeIds to trigger advanced search on backend
        if (
          allPages.length === 1 &&
          !lastPage.isAdvancedSearch &&
          lastPage.items.length > 0 &&
          lastPage.items.length <= 10
        ) {
          return 2; // Explicitly request page 2 to trigger excludeIds logic
        }

        return undefined;
      },
    });

  // Initialize the ref with initial results
  useEffect(() => {
    if (results?.items) {
      allMaterialIdsRef.current = results.items.map((item) => item.id);
    }
  }, [results]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const timeoutId = setTimeout(() => {
      if (entry?.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [entry?.isIntersecting, hasNextPage, fetchNextPage, isFetchingNextPage]);

  // Calculate total items across all pages
  const totalItemsShown =
    data?.pages.reduce((total, page) => total + page.items.length, 0) || 0;

  return (
    <div className="min-h-[60vh]">
      {/* Search Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <HugeiconsIcon
                icon={Search01Icon}
                strokeWidth={1.5}
                size={24}
                className="text-brand"
              />
              Search Results
            </h2>
            {metadata && (
              <p className="text-sm text-gray-600 mt-1">
                Found {totalItemsShown} result
                {totalItemsShown !== 1 ? "s" : ""} for "{query}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Loading State - Show skeleton cards */}
      {isSearching && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-16 md:pb-0">
          <MaterialCardSkeleton count={8} />
        </div>
      )}

      {/* Empty State */}
      {!isSearching && totalItemsShown === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center py-6 sm:py-8 md:py-12 px-4"
        >
          <div className="text-center max-w-lg w-full">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mb-3 sm:mb-4 md:mb-6 bg-gray-100 rounded-full">
              <HugeiconsIcon
                icon={Search01Icon}
                strokeWidth={1.5}
                size={24}
                className="sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400"
              />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
              No materials found for "{query}"
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6 md:mb-8 max-w-md mx-auto leading-relaxed px-2">
              We searched thoroughly but couldn't find any materials matching
              your query. You can help by uploading it if you have it.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 w-full max-w-md mx-auto">
              {onUpload && (
                <button
                  onClick={onUpload}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors duration-200 text-sm sm:text-base shadow-sm hover:shadow-md"
                >
                  <HugeiconsIcon
                    icon={UploadSquare01Icon}
                    strokeWidth={1.5}
                    size={16}
                    className="sm:w-[18px] sm:h-[18px]"
                  />
                  <span>Upload Material</span>
                </button>
              )}
              <div className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm sm:text-base">
                <span>It'll be here soon</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Grid */}
      {!isSearching && data?.pages && totalItemsShown > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {data.pages.map((page, i) => {
              const atLastPage = i === data.pages.length - 1;
              return (
                <React.Fragment key={i}>
                  {page.items.map((material, index) => {
                    const atLastElement =
                      atLastPage && index === page.items.length - 1;

                    return (
                      <motion.div
                        key={material.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.05,
                        }}
                      >
                        <MaterialCard
                          material={material}
                          onShare={onShare}
                          onRead={onRead}
                          componentRef={
                            atLastElement ? infiniteScrollTriggerRef : null
                          }
                        />
                      </motion.div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </motion.div>

          {/* Loading indicator for next page */}
          {isFetchingNextPage && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <MaterialCardSkeleton count={4} />
            </div>
          )}

          {/* End of results indicator */}
          {!hasNextPage && !isFetchingNextPage && totalItemsShown > 0 && (
            <div className="mt-8 text-center py-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-sm text-gray-600">
                <HugeiconsIcon
                  icon={Search01Icon}
                  strokeWidth={1.5}
                  size={16}
                />
                You've reached the end of search results
              </div>
            </div>
          )}

          <div className="pb-16 md:pb-0" />
        </>
      )}
    </div>
  );
};

export default SearchResults;
