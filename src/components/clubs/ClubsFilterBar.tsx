import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon, Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { CLUB_INTERESTS } from "@/data/clubs.constants";

interface ClubsFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeInterest: string;
  onInterestChange: (interest: string) => void;
}

const ClubsFilterBar: React.FC<ClubsFilterBarProps> = ({
  search,
  onSearchChange,
  activeInterest,
  onInterestChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative w-full max-w-xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search clubs by name, interest..."
              className="w-full pl-12 pr-10 py-2.5 text-base bg-white border border-gray-200 rounded-full placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200"
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} size={16} className="text-gray-400" />
              </button>
            )}
          </div>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white shrink-0 bg-brand hover:bg-brand/90 transition-colors duration-200"
            aria-label="Search"
          >
            <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={1.5} size={18} />
          </button>
        </div>
      </div>

      {/* Interest pills — scrollable on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-2 px-2">
        <button
          onClick={() => onInterestChange("")}
          className={`flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors border ${
            activeInterest === ""
              ? "bg-brand text-white border-brand shadow-sm"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          All
        </button>
        {CLUB_INTERESTS.map((interest) => (
          <button
            key={interest}
            onClick={() => onInterestChange(interest)}
            className={`flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors border ${
              activeInterest === interest
                ? "bg-brand text-white border-brand shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {interest}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClubsFilterBar;
