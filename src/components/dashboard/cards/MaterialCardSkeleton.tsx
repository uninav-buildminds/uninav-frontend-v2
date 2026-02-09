import React from "react";

interface MaterialCardSkeletonProps {
  count?: number;
}

const MaterialCardSkeleton: React.FC<MaterialCardSkeletonProps> = ({
  count = 1,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="relative overflow-hidden w-full">
          {/* Image Preview Skeleton */}
          <div className="aspect-square rounded-xl mb-3 bg-gray-200 relative overflow-hidden border border-gray-200">
            {/* Shimmer effect */}
            <div className="absolute inset-0 shimmer-sweep" />
          </div>

          {/* Content Skeleton */}
          <div className="space-y-1">
            {/* Title Skeleton */}
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 relative overflow-hidden">
              <div className="absolute inset-0 shimmer-sweep" />
            </div>

            {/* Metadata Row Skeleton */}
            <div className="flex items-center justify-between">
              <div className="h-3 bg-gray-200 rounded w-2/3 relative overflow-hidden">
                <div className="absolute inset-0 shimmer-sweep" />
              </div>
              <div className="h-4 w-4 bg-gray-200 rounded relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 shimmer-sweep" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default MaterialCardSkeleton;

