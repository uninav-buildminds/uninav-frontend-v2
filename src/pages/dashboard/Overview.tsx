import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsSection from "@/components/dashboard/MetricsSection";
import MaterialsSection from "@/components/dashboard/MaterialsSection";
import SearchResults from "@/components/dashboard/SearchResults";
import {
  Award01Icon,
  UploadSquare01Icon,
  DownloadSquare01Icon,
  Bookmark01Icon,
} from "hugeicons-react";
import {
  getMaterialRecommendations,
  getRecentMaterials,
  searchMaterials,
} from "@/api/materials.api";
import { getUserPoints } from "@/api/points.api";
import { Material } from "@/lib/types/material.types";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { SearchResult, SearchSuggestion } from "@/lib/types/search.types";

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLoading: isLoadingRecent, data: recentMaterials } = useQuery({
    queryKey: ["recentMaterials"],
    queryFn: async () => {
      const response = await getRecentMaterials();
      return response.data.items;
    },
    enabled: user !== undefined,
  });
  const { isLoading: isLoadingRecommended, data: recommendedMaterials } = useQuery({
    queryKey: ["recommendedMaterials"],
    queryFn: async () => {
      const response = await getMaterialRecommendations({
        limit: 10,
        ignorePreference: true,
      });
      return response.data.items;
    }
  })

  // Metrics state
  const [pointsPercentage, setPointsPercentage] = useState<string>("0%");
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult<Material> | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [advancedSearchEnabled, setAdvancedSearchEnabled] = useState(false);
  const [searchMetadata, setSearchMetadata] = useState<{
    total: number;
    page: number;
    totalPages: number;
    usedAdvanced: boolean;
  } | null>(null);

  const handleViewAll = (section: string) => {
    if (section === "recent materials") {
      navigate("/dashboard/recent");
    } else if (section === "recommendations") {
      navigate("/dashboard/recommendations");
    }
  };

  const handleFilter = (section: string) => {
    console.log(`Filter ${section}`);
  };

  const handleShare = (id: string) => {
    console.log(`Share material ${id}`);
  };

  const handleRead = (id: string) => {
    navigate(`/dashboard/material/${id}`);
  };

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Autocomplete search (lightweight - no advancedSearch, no ignorePreference)
  const handleSearchInput = useCallback((query: string) => {
    setSearchQuery(query);

    // If query is empty, reset to default view
    if (!query.trim()) {
      setIsSearchActive(false);
      setSearchResults(null);
      setSearchSuggestions([]);
      setSearchMetadata(null);
      setIsLoadingSuggestions(false);

      // Clear any pending debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      return;
    }

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set loading state immediately for better UX
    setIsLoadingSuggestions(true);

    // Debounce the API call (300ms)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await searchMaterials({
          query: query.trim(),
          limit: 5,
          page: 1,
          // No advancedSearch, no ignorePreference for autocomplete
        });

        if (response.status === "success" && response.data?.items) {
          const suggestions = response.data.items
            .slice(0, 5)
            .map((material: Material) => ({
              id: material.id,
              title: material.label,
              type: "material" as SearchSuggestion["type"],
              subtitle:
                material.targetCourse?.courseCode ||
                material.description?.slice(0, 50),
            }));
          setSearchSuggestions(suggestions);
        } else {
          setSearchSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSearchSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Full search with automatic fallback to advanced search
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setIsSearchActive(false);
        setSearchResults(null);
        setSearchMetadata(null);
        return;
      }

      setIsSearching(true);
      setIsSearchActive(true);
      setSearchQuery(query);

      try {
        // Try normal search first (or advanced if manually enabled)
        let response = await searchMaterials({
          query: query.trim(),
          limit: 10,
          page: 1,
          advancedSearch: advancedSearchEnabled,
        });

        // If no results and advanced search is not manually enabled, try advanced search
        let usedAdvanced = advancedSearchEnabled;
        if (
          !advancedSearchEnabled &&
          (response.status !== "success" ||
            !response.data?.items ||
            response.data.items.length === 0)
        ) {
          console.log(
            "No results with normal search, trying advanced search..."
          );
          response = await searchMaterials({
            query: query.trim(),
            limit: 10,
            page: 1,
            advancedSearch: true,
          });
          usedAdvanced = true;

          if (
            response.status === "success" &&
            response.data?.items &&
            response.data.items.length > 0
          ) {
            toast.info("Using advanced search to find more results");
          }
        }

        if (response.status === "success" && response.data?.items) {
          setSearchResults(response.data);
          setSearchMetadata({
            total: response.data.pagination.total,
            page: response.data.pagination.page,
            totalPages: response.data.pagination.totalPages,
            usedAdvanced,
          });
        } else {
          setSearchResults(null);
          setSearchMetadata(null);
        }
      } catch (error) {
        console.error("Error searching materials:", error);
        toast.error(error.message || "Search failed. Please try again.");
        setSearchResults(null);
        setSearchMetadata(null);
      } finally {
        setIsSearching(false);
      }
    },
    [advancedSearchEnabled]
  );

  // Toggle advanced search
  const toggleAdvancedSearch = useCallback(() => {
    setAdvancedSearchEnabled((prev) => !prev);
    // If there's an active search, re-run it with the new setting
    if (searchQuery.trim()) {
      setTimeout(() => handleSearch(searchQuery), 100);
    }
  }, [searchQuery, handleSearch]);

  // Load metrics data on component mount
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsLoadingMetrics(true);
        const pointsResponse = await getUserPoints();
        if (pointsResponse.status === "success" && pointsResponse.data) {
          setPointsPercentage(pointsResponse.data.points);
        }
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    loadMetrics();
  }, []);

  const metrics = [
    {
      icon: <Award01Icon size={20} />,
      title: "Your Points",
      value: pointsPercentage,
      description:
        "You're doing great! Upload 3 more materials to unlock Ad‑Free Week",
    },
    {
      icon: <DownloadSquare01Icon size={20} />,
      title: "Total Downloads",
      value: user?.downloadCount?.toString() || "0",
      description:
        "You have downloaded helpful materials. You're on track to complete academic goals",
    },
    {
      icon: <UploadSquare01Icon size={20} />,
      title: "Total Uploads",
      value: user?.uploadCount?.toString() || "0",
      description:
        "You have helped a lot of students. You're making a real difference",
    },
    {
      icon: <Bookmark01Icon size={20} />,
      title: "Saved Materials",
      value: user?.bookmarkCount?.toString() || "0",
      description:
        "Your materials were downloaded " +
        (user?.downloadCount?.toString() || "0") +
        " times. You're making a difference!",
    },
  ];

  return (
		<>
			<DashboardHeader
				firstName={user?.firstName || "User"}
				showSearch={true}
				searchSuggestions={searchSuggestions}
				isLoadingSuggestions={isLoadingSuggestions}
				onSearch={handleSearch}
				onSearchInput={handleSearchInput}
			/>
			<div className="p-4 sm:p-6">
				{/* Show search results when searching, otherwise show default content */}
				{isSearchActive && searchResults != null ? (
					<SearchResults
						query={searchQuery}
						results={searchResults}
						isSearching={isSearching}
						metadata={searchMetadata}
						advancedSearchEnabled={advancedSearchEnabled}
						onToggleAdvancedSearch={toggleAdvancedSearch}
						onShare={handleShare}
						onRead={handleRead}
						onClearSearch={() => {
							setSearchQuery("");
							setIsSearchActive(false);
							setSearchResults(null);
							setSearchMetadata(null);
						}}
					/>
				) : (
					<>
						{/* Metrics */}
						<MetricsSection metrics={metrics} />

						{/* Content Sections */}
						<div className="mt-8 space-y-8 pb-16 md:pb-0">
							{/* Recent Materials */}
							<MaterialsSection
								title="Recent Materials"
								materials={isLoadingRecent ? [] : (recentMaterials || [])}
								onViewAll={() =>
									handleViewAll("recent materials")
								}
								onFilter={() =>
									handleFilter("recent materials")
								}
								onShare={handleShare}
								onRead={handleRead}
								scrollStep={280}
								preserveOrder={true}
								isLoading={isLoadingRecent}
								emptyStateType="recent"
							/>

							{/* Recommendations - Grid layout with 2 rows */}
							<MaterialsSection
								title="Recommendations"
								materials={isLoadingRecommended ? [] : (recommendedMaterials || [])}
								onViewAll={() =>
									handleViewAll("recommendations")
								}
								onFilter={() => handleFilter("recommendations")}
								onShare={handleShare}
								onRead={handleRead}
								scrollStep={280}
								layout="grid"
								isLoading={isLoadingRecommended}
							/>
						</div>
					</>
				)}
			</div>
		</>
  );
};

export default Overview;
