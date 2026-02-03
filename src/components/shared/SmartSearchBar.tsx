import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight02Icon,
  Book01Icon,
  Cancel01Icon,
  File01Icon,
  Search01Icon,
  Clock01Icon,
} from '@hugeicons/core-free-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchSuggestion } from '@/lib/types/search.types';
import {
  useSmartAutocomplete,
  AutocompleteResult,
} from '@/hooks/useSmartAutocomplete';
import { cn } from '@/lib/utils';

interface SmartSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onInputChange?: (query: string) => void;
  suggestions?: SearchSuggestion[]; // API suggestions
  isLoading?: boolean;
  className?: string;
  value?: string;
  enableSmartAutocomplete?: boolean;
}

const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  placeholder = 'Enter a course code or course title',
  onSearch,
  onInputChange,
  suggestions = [],
  isLoading = false,
  className = '',
  value: controlledValue,
  enableSmartAutocomplete = true,
}) => {
  const [query, setQuery] = useState(controlledValue || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Smart autocomplete hook
  const {
    suggestions: smartSuggestions,
    tabCompletion,
    shouldShowTabCompletion,
    saveToHistory,
  } = useSmartAutocomplete(query, {
    enabled: enableSmartAutocomplete,
    minCharacters: 1,
  });

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

      // Only call API if query is >= 4 characters (per requirements)
      if (value.trim().length >= 4) {
        // Debounce API calls for non-empty input (300ms)
        debounceTimerRef.current = setTimeout(() => {
          onInputChange?.(value);
        }, 300);
      }
    },
    [onInputChange]
  );

  // Merge smart suggestions with API suggestions
  // On mobile: add tab completion to the top of the list
  // On desktop: show tab completion inline
  const combinedSuggestions = useMemo(() => {
    const combined: Array<SearchSuggestion & { isTabCompletion?: boolean; isSmartSuggestion?: boolean; smartType?: string }> = [];

    // On mobile, add tab completion as first item if available
    if (isMobile && shouldShowTabCompletion && tabCompletion) {
      combined.push({
        id: 'tab-completion',
        title: tabCompletion,
        type: 'material',
        isTabCompletion: true,
      });
    }

    // Add smart suggestions (from history/course codes)
    if (enableSmartAutocomplete && query.length > 0 && query.length < 4) {
      smartSuggestions.slice(0, 3).forEach((smart) => {
        combined.push({
          id: `smart-${smart.suggestion}`,
          title: smart.suggestion,
          type: smart.type === 'course' ? 'material' : 'material',
          subtitle: smart.type === 'history' ? 'Recent search' : undefined,
          isSmartSuggestion: true,
          smartType: smart.type,
        });
      });
    }

    // Add API suggestions (only shown when query >= 4 chars)
    if (query.length >= 4) {
      suggestions.forEach((suggestion) => {
        // Avoid duplicates
        if (!combined.some((s) => s.title.toLowerCase() === suggestion.title.toLowerCase())) {
          combined.push(suggestion);
        }
      });
    }

    return combined;
  }, [
    isMobile,
    shouldShowTabCompletion,
    tabCompletion,
    enableSmartAutocomplete,
    query,
    smartSuggestions,
    suggestions,
  ]);

  // Only show suggestions if we have a query and either loading or actual results
  const shouldShowSuggestions =
    query.length > 0 && (isLoading || combinedSuggestions.length > 0);

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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0);
    setSelectedIndex(-1);

    // Use debounced input change for API calls
    debouncedOnInputChange(value);

    // If input is cleared, trigger search with empty query to reset results immediately
    if (value === '') {
      onSearch?.('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Tab key for autocomplete (desktop only)
    if (e.key === 'Tab' && !isMobile && shouldShowTabCompletion && tabCompletion) {
      e.preventDefault();
      setQuery(tabCompletion);
      setShowSuggestions(false);
      return;
    }

    if (!showSuggestions || !shouldShowSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < combinedSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : combinedSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && combinedSuggestions[selectedIndex]) {
          handleSuggestionClick(combinedSuggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      saveToHistory(query.trim());
      onSearch?.(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    saveToHistory(suggestion.title);
    onSearch?.(suggestion.title);
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Call handlers immediately for clear action
    onInputChange?.('');
    onSearch?.('');
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

  // Calculate the grey preview text for tab completion (desktop only)
  const tabPreviewText = useMemo(() => {
    if (isMobile || !shouldShowTabCompletion || !tabCompletion || !query) {
      return '';
    }
    
    // Show the remaining part of the suggestion in grey
    const lowerQuery = query.toLowerCase();
    const lowerCompletion = tabCompletion.toLowerCase();
    
    if (lowerCompletion.startsWith(lowerQuery)) {
      return tabCompletion.substring(query.length);
    }
    
    return '';
  }, [isMobile, shouldShowTabCompletion, tabCompletion, query]);

  const getSuggestionIcon = (suggestion: SearchSuggestion & { isSmartSuggestion?: boolean; smartType?: string }) => {
    if (suggestion.smartType === 'history') {
      return Clock01Icon;
    }
    if (suggestion.type === 'course') {
      return Book01Icon;
    }
    return File01Icon;
  };

  const getSuggestionColor = (suggestion: SearchSuggestion & { isSmartSuggestion?: boolean; smartType?: string }) => {
    if (suggestion.smartType === 'history') {
      return 'bg-purple-100 text-purple-600';
    }
    if (suggestion.type === 'course') {
      return 'bg-blue-100 text-blue-600';
    }
    return 'bg-green-100 text-green-600';
  };

  return (
    <div className={cn('relative', className)}>
      {/* Search Input */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={1.5}
              size={18}
              className="text-gray-400"
            />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(shouldShowSuggestions)}
            placeholder={placeholder}
            className="w-full pl-12 pr-10 py-2.5 text-base border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200 bg-white"
          />
          {/* Tab completion preview (desktop only) */}
          {!isMobile && tabPreviewText && (
            <div className="absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none z-0 flex items-center">
              <span className="invisible">{query}</span>
              <span className="text-gray-400">{tabPreviewText}</span>
            </div>
          )}
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors z-20"
              aria-label="Clear search"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                strokeWidth={1.5}
                size={16}
                className="text-gray-400"
              />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white shrink-0 bg-brand hover:bg-brand/90 transition-colors duration-200"
          aria-label="Search"
        >
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            strokeWidth={1.5}
            size={18}
          />
        </button>
      </div>

      {/* Hint text for tab completion (desktop only) */}
      {!isMobile && shouldShowTabCompletion && tabPreviewText && (
        <div className="absolute left-0 top-full mt-1 text-xs text-gray-500 px-4 pointer-events-none">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-700 font-mono">Tab</kbd> to complete
        </div>
      )}

      {/* Suggestions Panel */}
      <AnimatePresence>
        {showSuggestions && shouldShowSuggestions && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-dropdown max-h-80 overflow-y-auto scrollbar-hide"
          >
            {isLoading && query.length >= 4 ? (
              <div className="p-4">
                <SkeletonLoader />
              </div>
            ) : (
              <div className="py-2">
                {combinedSuggestions.length > 0 ? (
                  <>
                    {combinedSuggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors duration-150',
                          index === selectedIndex && 'bg-gray-50',
                          suggestion.isTabCompletion && 'bg-brand/5 border-l-2 border-brand'
                        )}
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center',
                            getSuggestionColor(suggestion)
                          )}
                        >
                          <HugeiconsIcon
                            icon={getSuggestionIcon(suggestion)}
                            strokeWidth={1.5}
                            size={16}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {suggestion.title}
                            {suggestion.isTabCompletion && (
                              <span className="ml-2 text-xs text-brand font-normal">
                                (Suggested)
                              </span>
                            )}
                          </div>
                          {suggestion.subtitle && (
                            <div className="text-sm text-gray-500 truncate">
                              {suggestion.subtitle}
                            </div>
                          )}
                        </div>
                        {!isMobile && suggestion.isTabCompletion && (
                          <kbd className="hidden sm:inline-block px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded text-gray-600 font-mono">
                            Tab
                          </kbd>
                        )}
                      </button>
                    ))}
                  </>
                ) : query.length < 4 ? (
                  <div className="p-4 text-center">
                    <div className="text-gray-500 text-sm">
                      Keep typing to search materials
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      Enter at least 4 characters
                    </div>
                  </div>
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

export default SmartSearchBar;
