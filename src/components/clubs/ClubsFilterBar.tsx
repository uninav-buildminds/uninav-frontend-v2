import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, FilterIcon } from "@hugeicons/core-free-icons";
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
        <HugeiconsIcon
          icon={Search01Icon}
          strokeWidth={1.5}
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search clubs by name, interest..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all"
        />
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
