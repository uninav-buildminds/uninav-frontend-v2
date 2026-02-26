import React from "react";

const ClubCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      {/* Banner skeleton */}
      <div className="h-32 sm:h-36 bg-gray-100" />

      {/* Body */}
      <div className="p-4">
        {/* Tags */}
        <div className="flex gap-1.5 mb-2.5">
          <div className="h-5 w-16 rounded-full bg-gray-100" />
          <div className="h-5 w-20 rounded-full bg-gray-100" />
        </div>

        {/* Title */}
        <div className="h-5 w-3/4 rounded bg-gray-100 mb-2" />

        {/* Description */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-full rounded bg-gray-50" />
          <div className="h-3.5 w-2/3 rounded bg-gray-50" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-100" />
            <div className="h-3 w-20 rounded bg-gray-100" />
          </div>
          <div className="h-9 w-24 rounded-xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
};

export default ClubCardSkeleton;
