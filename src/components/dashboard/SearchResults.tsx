import React, { useEffect } from "react";
import { motion } from "framer-motion";
import MaterialCard from "./MaterialCard";
import { Material } from "@/lib/types/material.types";
import {
  Search01Icon,
  Cancel01Icon,
  SparklesIcon,
  InformationCircleIcon,
} from "hugeicons-react";
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
  } | null;
  advancedSearchEnabled: boolean;
  onToggleAdvancedSearch: () => void;
  onShare?: (id: string) => void;
  onRead?: (id: string) => void;
  onClearSearch: () => void;
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
}) => {
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
								{metadata.usedAdvanced && (
									<span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-md">
										<SparklesIcon size={12} />
										Advanced Search
									</span>
								)}
							</p>
						)}
					</div>

					<div className="flex items-center gap-3">
						{/* Advanced Search Toggle */}
						<button
							onClick={onToggleAdvancedSearch}
							className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
								advancedSearchEnabled
									? "bg-brand text-white hover:bg-brand/90"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
							title="Advanced search looks deeper into course descriptions, tags, and related materials">
							<SparklesIcon size={16} />
							Advanced
						</button>

						{/* Clear Search */}
						<button
							onClick={onClearSearch}
							className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">
							<Cancel01Icon size={16} />
							Clear
						</button>
					</div>
				</div>

				{/* Advanced Search Info Banner */}
				{advancedSearchEnabled && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-3">
						<InformationCircleIcon
							size={20}
							className="text-purple-600 mt-0.5"
						/>
						<div className="flex-1 text-sm text-purple-900">
							<span className="font-medium">
								Advanced Search Enabled:
							</span>{" "}
							Searching deeper into course descriptions, metadata,
							and related materials for more comprehensive
							results.
						</div>
					</motion.div>
				)}
			</div>

			{/* Loading State */}
			{isSearching && (
				<div className="flex items-center justify-center py-20">
					<div className="text-center">
						<div className="inline-flex items-center justify-center w-16 h-16 mb-4">
							<div className="w-16 h-16 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
						</div>
						<p className="text-gray-600 font-medium">
							Searching materials...
						</p>
						<p className="text-sm text-gray-500 mt-1">
							{advancedSearchEnabled
								? "Running advanced search"
								: "This won't take long"}
						</p>
					</div>
				</div>
			)}

			{/* Empty State */}
			{!isSearching && results.items.length === 0 && (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="flex items-center justify-center py-20">
					<div className="text-center max-w-md">
						<div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gray-100 rounded-full">
							<Search01Icon size={32} className="text-gray-400" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							No materials found
						</h3>
						<p className="text-gray-600 mb-6">
							We couldn't find any materials matching "{query}".
							{!advancedSearchEnabled && (
								<>
									{" "}
									Try enabling{" "}
									<button
										onClick={onToggleAdvancedSearch}
										className="text-brand font-medium hover:underline">
										Advanced Search
									</button>{" "}
									for more comprehensive results.
								</>
							)}
						</p>
						<div className="space-y-2 text-sm text-gray-500 text-left">
							<p className="font-medium text-gray-700">Try:</p>
							<ul className="list-disc list-inside space-y-1 ml-2">
								<li>Using different keywords</li>
								<li>Checking your spelling</li>
								<li>Using course codes (e.g., "CSC 204")</li>
								<li>Searching for broader terms</li>
							</ul>
						</div>
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
								{page.items.map((material, index) => {
									const atLastElement =
										atLastPage &&
                    index == page.items.length - 1;

									return (
										<motion.div
											key={material.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{
												delay: index * 0.05,
											}}>
											<MaterialCard
												material={material}
												onShare={onShare}
												onRead={onRead}
												componentRef={
													atLastElement
														? infiniteScrollTriggerRef
														: null
												}
											/>
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
