import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsSection from "@/components/dashboard/MetricsSection";
import MaterialsSection from "@/components/dashboard/MaterialsSection";
import SearchResults from "@/components/dashboard/SearchResults";
import { UploadModal } from "@/components/modals";
import { HugeiconsIcon } from "@hugeicons/react";
import { Award01Icon, Bookmark01Icon, DownloadSquare01Icon, UploadSquare01Icon } from "@hugeicons/core-free-icons";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { isLoading: isLoadingRecent, data: recentMaterials } = useQuery({
    queryKey: ["recentMaterials"],
    queryFn: async () => {
      const response = await getRecentMaterials();
      return response.data.items;
    },
    enabled: user !== undefined,
  });
  const { isLoading: isLoadingRecommended, data: recommendedMaterials } =
    useQuery({
      queryKey: ["recommendedMaterials"],
      queryFn: async () => {
        const response = await getMaterialRecommendations({
          limit: 10,
          ignorePreference: true,
        });
        return response.data.items;
      },
    });

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Metrics state
  const [pointsPercentage, setPointsPercentage] = useState<string>("0%");
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  // Search state - initialize from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchResults, setSearchResults] =
    useState<SearchResult<Material> | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<
    SearchSuggestion[]
  >([]);
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

  const handleRead = (slug: string) => {
    navigate(`/dashboard/material/${slug}`);
  };

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Restore search from URL on mount
  useEffect(() => {
    const queryFromUrl = searchParams.get("q");
    if (queryFromUrl && queryFromUrl.trim()) {
      setSearchQuery(queryFromUrl);
      handleSearch(queryFromUrl);
    }
  }, []); // Run only once on mount

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
      // Clear URL params
      setSearchParams({});

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

  // Full search - backend handles automatic fallback to advanced search
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
      // Update URL params
      setSearchParams({ q: query.trim() });

      try {
        // Backend automatically falls back to advanced search if normal search returns no results
        const response = await searchMaterials({
          query: query.trim(),
          limit: 10,
          page: 1,
          advancedSearch: advancedSearchEnabled, // Only use if user explicitly toggled it
        });

        if (response.status === "success" && response.data?.items) {
          setSearchResults(response.data);
          // Get usedAdvanced from response (backend may have auto-fallback)
          const usedAdvanced =
            (response.data as any).usedAdvanced || advancedSearchEnabled;
          setSearchMetadata({
            total: response.data.pagination.total,
            page: response.data.pagination.page,
            totalPages: response.data.pagination.totalPages,
            usedAdvanced,
          });

          // Show info if backend auto-used advanced search
          if (usedAdvanced && !advancedSearchEnabled) {
            toast.info("Using advanced search to find more results");
          }
        } else {
          setSearchResults(null);
          setSearchMetadata(null);
        }
      } catch (error: any) {
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

  // Toggle advanced search - re-run search with new setting
  const toggleAdvancedSearch = useCallback(() => {
    const newValue = !advancedSearchEnabled;
    setAdvancedSearchEnabled(newValue);
    // If there's an active search, re-run it with the new setting
    if (searchQuery.trim() && isSearchActive) {
      handleSearch(searchQuery);
    }
  }, [advancedSearchEnabled, searchQuery, isSearchActive, handleSearch]);

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

  // Metrics cards configuration for the overview dashboard
  const metrics = [
    {
      icon: <HugeiconsIcon icon={Award01Icon} strokeWidth={1.5} size={20} />,
      title: "Your Points",
      value: pointsPercentage,
      description:
        "Earned from reading and uploading materials. Upload 3 more materials to unlock Ad‑Free Week",
    },
    {
      icon: <HugeiconsIcon icon={DownloadSquare01Icon} strokeWidth={1.5} size={20} />,
      title: "Total Downloads",
      value: user?.downloadCount?.toString() || "0",
      description:
        (user?.downloadCount || 0) === 0
          ? "Start downloading materials to access helpful study resources"
          : "You have downloaded helpful materials. You're on track to complete academic goals",
    },
    {
      icon: <HugeiconsIcon icon={UploadSquare01Icon} strokeWidth={1.5} size={20} />,
      title: "Total Uploads",
      value: user?.uploadCount?.toString() || "0",
      description:
        (user?.uploadCount || 0) === 0
          ? "Share your first material to help fellow students and earn points"
          : "You have helped a lot of students. You're making a real difference",
    },
    {
      icon: <HugeiconsIcon icon={Bookmark01Icon} strokeWidth={1.5} size={20} />,
      title: "Saved Materials",
      value: user?.bookmarkCount?.toString() || "0",
      description:
        (user?.bookmarkCount || 0) === 0
          ? "Bookmark materials you want to access later"
          : `You have saved ${user?.bookmarkCount || 0} ${
              (user?.bookmarkCount || 0) === 1 ? "material" : "materials"
            }. Access them anytime from your bookmarks`,
    },
  ];

  // Decide when to render the Recent Materials section (keep while loading, hide when fetched and empty)
  const shouldShowRecentMaterials =
    isLoadingRecent || (recentMaterials && recentMaterials.length > 0);

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
          <>
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
                // Clear URL params
                setSearchParams({});
              }}
              onUpload={() => setShowUploadModal(true)}
            />
            <UploadModal
              isOpen={showUploadModal}
              onClose={() => setShowUploadModal(false)}
            />
          </>
        ) : (
          <>
            {/* Metrics */}
            <MetricsSection metrics={metrics} />

            {/* Content Sections */}
            <div className="mt-8 space-y-8 pb-16 md:pb-0">
              {/* Recent Materials - only show when loading or when there are items */}
              {shouldShowRecentMaterials && (
                <MaterialsSection
                  title="Recent Materials"
                  materials={isLoadingRecent ? [] : recentMaterials || []}
                  onViewAll={() => handleViewAll("recent materials")}
                  onFilter={() => handleFilter("recent materials")}
                  onShare={handleShare}
                  onRead={handleRead}
                  scrollStep={280}
                  preserveOrder={true}
                  isLoading={isLoadingRecent}
                  emptyStateType="recent"
                />
              )}

              {/* Recommendations - Grid layout with 2 rows */}
              <MaterialsSection
                title="Recommendations"
                materials={
                  isLoadingRecommended ? [] : recommendedMaterials || []
                }
                onViewAll={() => handleViewAll("recommendations")}
                onFilter={() => handleFilter("recommendations")}
                onShare={handleShare}
                onRead={handleRead}
                scrollStep={280}
                layout="grid"
                isLoading={isLoadingRecommended}
                emptyStateType="recommendations"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Overview;
