import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Search01Icon,
  ArrowRight02Icon,
  Book01Icon,
  File01Icon,
  Cancel01Icon,
} from "hugeicons-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchSuggestion {
  id: string;
  title: string;
  type: "course" | "material";
  subtitle?: string;
  icon?: React.ReactNode;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onInputChange?: (query: string) => void;
  suggestions?: SearchSuggestion[];
  isLoading?: boolean;
  className?: string;
  value?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Enter a course code or course title",
  onSearch,
  onInputChange,
  suggestions = [],
  isLoading = false,
  className = "",
  value: controlledValue,
}) => {
  const [query, setQuery] = useState(controlledValue || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update internal state when controlled value changes
  useEffect(() => {
    if (controlledValue !== undefined) {
      setQuery(controlledValue);
    }
  }, [controlledValue]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounced input change handler
  const debouncedOnInputChange = useCallback(
    (value: string) => {
      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // If input is empty, call immediately
      if (!value.trim()) {
        onInputChange?.(value);
        return;
      }

      // Debounce API calls for non-empty input (300ms)
      debounceTimerRef.current = setTimeout(() => {
        onInputChange?.(value);
      }, 300);
    },
    [onInputChange]
  );

  // Only show suggestions if we have a query and either loading or actual results
  const shouldShowSuggestions =
    query.length > 0 && (isLoading || suggestions.length > 0);
  const displaySuggestions = suggestions;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0);
    setSelectedIndex(-1);

    // Use debounced input change for API calls
    debouncedOnInputChange(value);

    // If input is cleared, trigger search with empty query to reset results immediately
    if (value === "") {
      onSearch?.("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || !shouldShowSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < displaySuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : displaySuggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && displaySuggestions[selectedIndex]) {
          handleSuggestionClick(displaySuggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSearch?.(suggestion.title);
  };

  const handleClear = () => {
    setQuery("");
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Call handlers immediately for clear action
    onInputChange?.("");
    onSearch?.("");
  };

  const SkeletonLoader = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Search01Icon size={18} className="text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(shouldShowSuggestions)}
            placeholder={placeholder}
            className="w-full pl-12 pr-10 py-2.5 text-base border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <Cancel01Icon size={16} className="text-gray-400" />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white shrink-0 bg-brand hover:bg-brand/90 transition-colors duration-200"
          aria-label="Search"
        >
          <ArrowRight02Icon size={18} />
        </button>
      </div>

      {/* Suggestions Panel */}
      <AnimatePresence>
        {showSuggestions && shouldShowSuggestions && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-dropdown max-h-80 overflow-y-auto scrollbar-hide"
          >
            {isLoading ? (
              <div className="p-4">
                <SkeletonLoader />
              </div>
            ) : (
              <div className="py-2">
                {displaySuggestions.length > 0 ? (
                  displaySuggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                        index === selectedIndex ? "bg-gray-50" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          suggestion.type === "course"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {suggestion.type === "course" ? (
                          <Book01Icon size={16} />
                        ) : (
                          <File01Icon size={16} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {suggestion.title}
                        </div>
                        {suggestion.subtitle && (
                          <div className="text-sm text-gray-500 truncate">
                            {suggestion.subtitle}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center">
                    <div className="text-gray-500 text-sm">
                      No suggestions found
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      Press Enter to search for "{query}"
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
