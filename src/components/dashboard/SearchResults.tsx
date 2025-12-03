import React, { useEffect } from "react";
import { motion } from "framer-motion";
import MaterialCard from "./MaterialCard";
import FolderCard from "./FolderCard";
import MaterialCardSkeleton from "./MaterialCardSkeleton";
import { Material } from "@/lib/types/material.types";
import { Folder } from "@/api/folder.api";
import {
  Search01Icon,
  Cancel01Icon,
  SparklesIcon,
  UploadSquare01Icon,
  ArrowRight01Icon,
} from "hugeicons-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { searchMaterials } from "@/api/materials.api";
import { SearchResult } from "@/lib/types/search.types";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";
import { isMaterial, isFolder } from "@/lib/utils/typeGuards";
import { useNavigate } from "react-router-dom";

interface SearchResultsProps {
  query: string;
  results: SearchResult<Material | Folder>;
  isSearching: boolean;
  metadata: {
    total: number;
    page: number;
    totalPages: number;
    usedAdvanced: boolean;
  } | null;
  advancedSearchEnabled: boolean;
  onToggleAdvancedSearch: () => void;
  onShare?: (id: string) => void;
  onRead?: (id: string) => void;
  onClearSearch: () => void;
  onUpload?: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  isSearching,
  metadata,
  advancedSearchEnabled,
  onToggleAdvancedSearch,
  onShare,
  onRead,
  onClearSearch,
  onUpload,
}) => {
  const navigate = useNavigate();

  async function handleInfiniteQuery({ pageParam = 1}) {
    const response = await searchMaterials({
      query: query.trim(),
      advancedSearch: advancedSearchEnabled,
      page: pageParam,
    });
    return response.data;
  }
  
  const { entry, ref: infiniteScrollTriggerRef } = useInView({ threshold: 0.25 });
    
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["search", query, advancedSearchEnabled],
    queryFn: handleInfiniteQuery,
    initialPageParam: results.pagination.page,
    initialData: { pages: [results], pageParams: [results.pagination.page] },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    }
  });

  
  useEffect(() => {
    if (!hasNextPage) return;

    const timeoutId = setTimeout(() => {
      if (entry?.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [entry?.isIntersecting, hasNextPage, fetchNextPage]);

  // Show toast when advanced search is enabled
  useEffect(() => {
    if (advancedSearchEnabled) {
      toast.info("Searching more thoroughly for better results", {
        duration: 4000,
      });
    }
  }, [advancedSearchEnabled]);

  return (
		<div className="min-h-[60vh]">
			{/* Search Header */}
			<div className="mb-6">
				<div className="flex items-center justify-between flex-wrap gap-4">
					<div className="flex-1">
						<h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
							<Search01Icon size={24} className="text-brand" />
							Search Results
						</h2>
						{metadata && (
							<p className="text-sm text-gray-600 mt-1">
								Found {metadata.total} result
								{metadata.total !== 1 ? "s" : ""} for "{query}"
							</p>
						)}
					</div>

					<div className="flex items-center gap-3">
						{/* Advanced Search Toggle - Reduced size */}
						<button
							onClick={onToggleAdvancedSearch}
							className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
								advancedSearchEnabled
									? "bg-brand text-white hover:bg-brand/90"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
							title="Advanced search looks deeper into course descriptions, tags, and related materials">
							<SparklesIcon size={14} />
							Advanced
						</button>
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
			{!isSearching && results.items.length === 0 && (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="flex items-center justify-center py-6 sm:py-8 md:py-12 px-4">
					<div className="text-center max-w-lg w-full">
						<div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mb-3 sm:mb-4 md:mb-6 bg-gray-100 rounded-full">
							<Search01Icon size={24} className="sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-400" />
						</div>
						<h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
							No materials found for "{query}"
						</h3>
						<p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6 md:mb-8 max-w-md mx-auto leading-relaxed px-2">
							We couldn't find any materials matching your search. It might be added soon, or you can help by uploading it if you have it.
						</p>
						
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 w-full max-w-md mx-auto">
							{onUpload && (
								<button
									onClick={onUpload}
									className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors duration-200 text-sm sm:text-base shadow-sm hover:shadow-md">
									<UploadSquare01Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
									<span>Upload Material</span>
								</button>
							)}
							<div className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm sm:text-base">
								<span>It'll be here soon</span>
							</div>
						</div>

						{!advancedSearchEnabled && (
							<p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 px-2">
								Or try{" "}
								<button
									onClick={onToggleAdvancedSearch}
									className="text-brand font-medium hover:underline">
									Advanced Search
								</button>{" "}
								for more comprehensive results.
							</p>
						)}
					</div>
				</motion.div>
			)}

			{/* Results Grid */}
			{!isSearching && data.pages.length > 0 && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.1 }}
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-16 md:pb-0">
					{data.pages.map((page, i) => {
            const atLastPage = i == data.pages.length - 1;
						return (
							<React.Fragment key={i}>
								{page.items.map((item, index) => {
									const atLastElement =
										atLastPage &&
                    index == page.items.length - 1;

									return (
										<motion.div
											key={item.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{
												delay: index * 0.05,
											}}>
											{isMaterial(item) ? (
												<MaterialCard
													material={item}
													onShare={onShare}
													onRead={onRead}
													componentRef={
														atLastElement
															? infiniteScrollTriggerRef
															: null
													}
												/>
											) : isFolder(item) ? (
												<FolderCard
													folder={item}
													onClick={() => navigate(`/dashboard/folders/${item.id}`)}
													materialCount={item.content?.length || 0}
												/>
											) : null}
										</motion.div>
									);
								})}
							</React.Fragment>
						);
					})}
				</motion.div>
			)}

			{/* Pagination Info
			{!isSearching &&
				results.items.length > 0 &&
				metadata &&
				metadata.totalPages > 1 && (
					<div className="mt-8 text-center text-sm text-gray-600">
						Page {metadata.page} of {metadata.totalPages}
					</div>
				)} */}
		</div>
  );
};

export default SearchResults;
