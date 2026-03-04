import React from "react";
import { CLUB_INTERESTS } from "@/data/clubs.constants";

interface InterestsPickerProps {
  selected: string[];
  onChange: (interests: string[]) => void;
  readOnly?: boolean;
  maxSelections?: number;
}

const InterestsPicker: React.FC<InterestsPickerProps> = ({
  selected,
  onChange,
  readOnly = false,
  maxSelections = 10,
}) => {
  const toggle = (interest: string) => {
    if (selected.includes(interest)) {
      onChange(selected.filter((i) => i !== interest));
    } else if (selected.length < maxSelections) {
      onChange([...selected, interest]);
    }
  };

  if (readOnly) {
    if (selected.length === 0) {
      return (
        <p className="text-sm text-gray-400 italic">No interests added yet.</p>
      );
    }
    return (
      <div className="flex flex-wrap gap-2">
        {selected.map((interest) => (
          <span
            key={interest}
            className="px-3 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/20"
          >
            {interest}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {CLUB_INTERESTS.map((interest) => {
          const isSelected = selected.includes(interest);
          const isDisabled = !isSelected && selected.length >= maxSelections;
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggle(interest)}
              disabled={isDisabled}
              className={[
                "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                isSelected
                  ? "bg-brand text-white border-brand"
                  : isDisabled
                    ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 border-gray-200 hover:border-brand hover:text-brand",
              ].join(" ")}
            >
              {interest}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400">
        {selected.length}/{maxSelections} selected
      </p>
    </div>
  );
};

export default InterestsPicker;
