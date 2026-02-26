import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MaterialsLayout from "@/components/dashboard/layout/MaterialsLayout";
import { getGuides } from "@/api/materials.api";
import { Material } from "@/lib/types/material.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";

const PLACEHOLDER_IMAGE = "/placeholder.svg";

// Dedicated page for listing and opening guide materials
const GuidesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch guides from the backend with optional search query
  const { data, isLoading, isError } = useQuery({
    queryKey: ["guides", searchQuery],
    queryFn: async () => {
      const response = await getGuides({
        query: searchQuery || undefined,
        ignorePreference: true,
        saveHistory: false,
      });
      return response.data;
    },
  });

  const guides: Material[] = useMemo(() => data?.items ?? [], [data]);

  const searchSuggestions = useMemo(
    () => guides.map((guide) => guide.label).filter(Boolean),
    [guides],
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleOpenGuide = (slug: string) => {
    navigate(`/dashboard/material/${slug}`);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[...Array(6)].map((_, index) => (
            <Card
              key={index}
              className="border border-gray-200 shadow-sm overflow-hidden"
            >
              <Skeleton className="aspect-video w-full rounded-none" />
              <CardContent className="p-3 sm:p-4 space-y-3">
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm font-medium text-gray-900 mb-1">
            Unable to load guides
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Please try again in a moment.
          </p>
          <Button variant="outline" onClick={() => handleSearch(searchQuery)}>
            Retry
          </Button>
        </div>
      );
    }

    if (!guides.length) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            No guides available yet
          </p>
          <p className="text-sm text-gray-600 max-w-md">
            Once guides are published, you’ll see step-by-step walkthroughs here
            to help you get the most out of UniNav.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {guides.map((guide) => (
          <Card
            key={guide.id}
            className="border border-gray-200 hover:border-brand/40 hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
            onClick={() => handleOpenGuide(guide.slug)}
          >
            {/* Preview image from material.previewUrl */}
            <div className="aspect-video overflow-hidden relative bg-gray-100 border-b border-gray-100">
              <img
                src={guide.previewUrl || PLACEHOLDER_IMAGE}
                alt={guide.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = PLACEHOLDER_IMAGE;
                }}
              />
              <Badge
                variant="secondary"
                className="absolute top-2 right-2 text-[10px] uppercase tracking-wide bg-white/95 text-brand border border-brand/20 shadow-sm"
              >
                Guide
              </Badge>
            </div>
            <CardContent className="p-3 sm:p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm sm:text-base leading-tight">
                {guide.label}
              </h3>
              {guide.description && (
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {guide.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                <span>
                  {formatRelativeTime(guide.updatedAt || guide.createdAt)}
                </span>
                {guide.creator && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-gray-300 shrink-0" />
                    <span className="truncate">
                      {guide.creator.firstName} {guide.creator.lastName}
                    </span>
                  </>
                )}
              </div>
              {guide.tags && guide.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {guide.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[10px] px-2 py-0 border-gray-200 bg-gray-50"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {guide.tags.length > 3 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-2 py-0 border-dashed border-gray-200 bg-gray-50"
                    >
                      +{guide.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              <Button
                size="sm"
                className="w-full rounded-full h-9 text-xs font-medium bg-brand text-white hover:bg-brand/90 shadow-sm"
                onClick={(event) => {
                  event.stopPropagation();
                  handleOpenGuide(guide.slug);
                }}
              >
                Open guide
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <MaterialsLayout
      title="Guides"
      onSearch={handleSearch}
      searchPlaceholder="Search guides..."
      searchSuggestions={searchSuggestions}
      showBackButton={false}
      subtitle="Step-by-step guides to help you get the most out of UniNav."
    >
      {/* Floating UniNav logo – click to go home; z-fixed so it sits above PageHeader (z-sticky) */}
      <Link
        to="/"
        className="fixed left-3 sm:left-4 top-3 sm:top-4 z-fixed flex items-center gap-1.5 sm:gap-2 px-2.5 py-2 sm:px-3 sm:py-2.5 bg-white/90 backdrop-blur hover:bg-white border border-gray-200 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Go to UniNav home"
      >
        <img
          src="/assets/logo.svg"
          alt=""
          className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0"
        />
        <span className="text-sm sm:text-base font-semibold text-brand hidden sm:inline">
          UniNav
        </span>
      </Link>
      <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-0 pb-10">
        {renderContent()}
      </div>
    </MaterialsLayout>
  );
};

export default GuidesPage;
