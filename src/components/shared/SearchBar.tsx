import React, { useState, useRef, useEffect } from "react";
import { Search01Icon, ArrowRight02Icon, Book01Icon, File01Icon } from "hugeicons-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'course' | 'material';
  subtitle?: string;
  icon?: React.ReactNode;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  suggestions?: SearchSuggestion[];
  isLoading?: boolean;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Enter a course code or course title",
  onSearch,
  suggestions = [],
  isLoading = false,
  className = ""
}) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Mock suggestions for demo
  const mockSuggestions: SearchSuggestion[] = [
    { id: "1", title: "MTH 202 - Calculus II", type: 'course', subtitle: "Mathematics Department" },
    { id: "2", title: "CSC 204 - Data Structures", type: 'course', subtitle: "Computer Science" },
    { id: "3", title: "ENG 101 - Essay Writing Guide", type: 'material', subtitle: "Uploaded 2 days ago" },
    { id: "4", title: "PHY 101 - Physics Lab Manual", type: 'material', subtitle: "Uploaded 1 week ago" },
    { id: "5", title: "CHEM 201 - Organic Chemistry Notes", type: 'material', subtitle: "Uploaded 3 days ago" },
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : mockSuggestions;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < displaySuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : displaySuggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
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
            onFocus={() => setShowSuggestions(query.length > 0)}
            placeholder={placeholder}
            className="w-full pl-12 pr-4 py-2.5 text-base border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200"
          />
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
        {showSuggestions && (
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
                        index === selectedIndex ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        suggestion.type === 'course' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {suggestion.type === 'course' ? (
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
                  <div className="p-4 text-center text-gray-500">
                    No suggestions found
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
