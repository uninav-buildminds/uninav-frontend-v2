import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import ReviewTabs from "./ReviewTabs";

interface ReviewCounts {
  pending: number;
  approved: number;
  rejected: number;
  all: number;
}

interface ReviewPageLayoutProps {
  title: string;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  searchPlaceholder: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: ReviewCounts;
  isLoading: boolean;
  error: string | null;
  emptyStateIcon: React.ComponentType<{ className?: string }>;
  emptyStateTitle: string;
  getEmptyStateMessage: (activeTab: string) => string;
  showBackButton?: boolean;
  children: React.ReactNode;
}

const ReviewPageLayout: React.FC<ReviewPageLayoutProps> = ({
  title,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  searchPlaceholder,
  activeTab,
  onTabChange,
  counts,
  isLoading,
  error,
  emptyStateIcon: EmptyIcon,
  emptyStateTitle,
  getEmptyStateMessage,
  showBackButton = false,
  children,
}) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-1 text-gray-600"
          >
            <ArrowLeft size={16} /> Back
          </Button>
        )}
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        onSubmit={onSearchSubmit}
        placeholder={searchPlaceholder}
      />

      {/* Tabs with Content */}
      <ReviewTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        pendingCount={counts.pending}
        approvedCount={counts.approved}
        rejectedCount={counts.rejected}
        allCount={counts.all}
      >
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
          ) : (
            <>
              {/* Check if children is empty (no items) */}
              {React.Children.count(children) === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <EmptyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {emptyStateTitle}
                  </h3>
                  <p className="text-gray-600">
                    {getEmptyStateMessage(activeTab)}
                  </p>
                </div>
              ) : (
                children
              )}
            </>
          )}
        </div>
      </ReviewTabs>
    </div>
  );
};

export default ReviewPageLayout;
