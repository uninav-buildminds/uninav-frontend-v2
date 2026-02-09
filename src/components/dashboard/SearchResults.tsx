import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import MaterialCard from "./MaterialCard";
import FolderCard from "./FolderCard";
import MaterialCardSkeleton from "./MaterialCardSkeleton";
import { Material } from "@/lib/types/material.types";
import { Folder } from "@/api/folder.api";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, UploadSquare01Icon } from "@hugeicons/core-free-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { searchMaterialsAndFolders } from "@/api/materials.api";
import { SearchResult } from "@/lib/types/search.types";
import { useInView } from "react-intersection-observer";

interface SearchResultsProps {
  query: string;
  // Full search results for the initial page; null while first page is loading or on error
  results: SearchResult<Material | Folder> | null;
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
  onFolderClick?: (slug: string) => void;
  onClearSearch: () => void;
  onUpload?: () => void;
  // Optional error message for failed searches
  error?: string | null;
  // Optional retry handler so users can easily retry a failed search
  onRetry?: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  isSearching,
  metadata,
  onShare,
  onRead,
  onFolderClick,
  onClearSearch,
  onUpload,
  error,
  onRetry,
}) => {
  // Track folder fetch state to stop fetching when folders run out
  const [foldersFetchComplete, setFoldersFetchComplete] = useState(false);

  // Track all material IDs to avoid duplicates
  const allMaterialIdsRef = useRef<string[]>([]);

  const { entry, ref: infiniteScrollTriggerRef } = useInView({
    threshold: 0.25,
  });

  // Track whether we have an initial page of results to seed the infinite query
  const hasInitialResults = !!results;

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
          includeFolders: !foldersFetchComplete, // Only fetch folders if not complete
        };

        // Only add excludeIds if it has valid values
        if (excludeIds && excludeIds.length > 0) {
          searchParams.excludeIds = excludeIds;
        }

        const response = await searchMaterialsAndFolders(searchParams);

        // Check if folders fetch is complete
        const foldersHasMore = (response.data?.pagination as any)
          ?._foldersHasMore;
        if (foldersHasMore === false) {
          setFoldersFetchComplete(true);
        }

        // Update the material IDs ref with new materials (excluding folders)
        if (response.data?.items) {
          response.data.items.forEach((item: Material | Folder) => {
            const isFolder = "_type" in item && item._type === "folder";
            if (!isFolder && !allMaterialIdsRef.current.includes(item.id)) {
              allMaterialIdsRef.current.push(item.id);
            }
          });
        }

        return response.data;
      },
      // When there are no initial results yet (first search still in-flight or error),
      // avoid seeding the infinite query and let it stay idle.
      initialPageParam: hasInitialResults ? results.pagination.page : 1,
      initialData: hasInitialResults
        ? { pages: [results], pageParams: [results.pagination.page] }
        : undefined,
      enabled: hasInitialResults,
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

  // Initialize the ref with initial results (materials only)
  useEffect(() => {
    if (results?.items) {
      allMaterialIdsRef.current = results.items
        .filter((item) => !("_type" in item && item._type === "folder"))
        .map((item) => item.id);

      // Check initial folder state
      const initialFoldersHasMore = (results.pagination as any)
        ?._foldersHasMore;
      if (initialFoldersHasMore === false) {
        setFoldersFetchComplete(true);
      }
    }
  }, [results]);

  // Reset folder fetch state when query changes
  useEffect(() => {
    setFoldersFetchComplete(false);
  }, [query]);

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
    data?.pages?.reduce((total, page) => total + page.items.length, 0) || 0;

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

      {/* Error State */}
      {!isSearching && error && (
        <div className="flex items-center justify-center py-8">
          <div className="max-w-md w-full rounded-2xl border border-red-100 bg-red-50 px-4 py-5 sm:px-6 sm:py-6 text-center shadow-sm">
            <p className="text-sm sm:text-base font-medium text-red-700 mb-2">
              We couldn't complete your search
            </p>
            <p className="text-xs sm:text-sm text-red-600 mb-4">
              {error}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-brand text-white hover:bg-brand/90 transition-colors duration-200"
                >
                  Try again
                </button>
              )}
              <button
                type="button"
                onClick={onClearSearch}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              >
                Clear search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isSearching && !error && totalItemsShown === 0 && hasInitialResults && (
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
                  {page.items.map((item, index) => {
                    const atLastElement =
                      atLastPage && index === page.items.length - 1;
                    const isFolder = "_type" in item && item._type === "folder";

                    return (
                      <motion.div
                        key={`${isFolder ? "folder" : "material"}-${item.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.05,
                        }}
                      >
                        {isFolder ? (
                          <FolderCard
                            folder={item as Folder}
                            onClick={() => {
                              // Navigate to folder view
                              onFolderClick?.(item.slug);
                            }}
                            materialCount={(item as any).materialCount || 0}
                          />
                        ) : (
                          <MaterialCard
                            material={item as Material}
                            onShare={onShare}
                            onRead={onRead}
                            componentRef={
                              atLastElement ? infiniteScrollTriggerRef : null
                            }
                          />
                        )}
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
