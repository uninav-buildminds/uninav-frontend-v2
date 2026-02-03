import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  COURSE_CODE_PREFIXES,
  DEPARTMENT_NAMES,
  extractCourseCodePrefix,
  matchesDepartment,
  getCourseCodePrefixesForDepartment,
} from '@/data/autocomplete.constants';

const SEARCH_HISTORY_KEY = 'uninav_search_history';
const MAX_HISTORY_SIZE = 50;

interface AutocompleteResult {
  suggestion: string;
  type: 'history' | 'course' | 'department';
  confidence: number; // 0-1, higher means more confident
}

export interface UseSmartAutocompleteOptions {
  enabled?: boolean;
  minCharacters?: number;
}

/**
 * Smart autocomplete hook that learns from user search history
 * Provides tab-completion suggestions based on:
 * 1. User's search history (highest priority)
 * 2. Course code prefixes (e.g., MAT -> MATHEMATICS)
 * 3. Department name matches
 */
export function useSmartAutocomplete(
  query: string,
  options: UseSmartAutocompleteOptions = {}
) {
  const { enabled = true, minCharacters = 1 } = options;

  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage on mount
  useEffect(() => {
    if (!enabled) return;

    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const history = JSON.parse(stored);
        setSearchHistory(Array.isArray(history) ? history : []);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
      setSearchHistory([]);
    }
  }, [enabled]);

  /**
   * Save a search query to history
   */
  const saveToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) return;

    const normalized = searchQuery.trim();

    setSearchHistory((prev) => {
      // Remove duplicates and add to front
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== normalized.toLowerCase()
      );
      const newHistory = [normalized, ...filtered].slice(0, MAX_HISTORY_SIZE);

      // Persist to localStorage
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }

      return newHistory;
    });
  }, []);

  /**
   * Clear search history
   */
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }, []);

  /**
   * Generate autocomplete suggestions based on current query
   */
  const suggestions = useMemo((): AutocompleteResult[] => {
    if (!enabled || !query || query.length < minCharacters) {
      return [];
    }

    const normalizedQuery = query.trim();
    const upperQuery = normalizedQuery.toUpperCase();
    const results: AutocompleteResult[] = [];

    // 1. Check search history first (highest priority)
    const historyMatches = searchHistory
      .filter((item) =>
        item.toLowerCase().startsWith(normalizedQuery.toLowerCase())
      )
      .slice(0, 3) // Top 3 history matches
      .map((item) => ({
        suggestion: item,
        type: 'history' as const,
        confidence: 0.9, // High confidence for history
      }));

    results.push(...historyMatches);

    // 2. Check if query starts with a course code prefix
    const coursePrefix = extractCourseCodePrefix(upperQuery);
    if (coursePrefix) {
      const departments = COURSE_CODE_PREFIXES[coursePrefix] || [];
      
      // If user typed just the prefix (e.g., "MAT"), suggest completing it
      if (upperQuery === coursePrefix) {
        departments.forEach((dept) => {
          results.push({
            suggestion: `${coursePrefix} - ${dept}`,
            type: 'course',
            confidence: 0.8,
          });
        });
      } else {
        // User has typed beyond prefix, help complete the number part
        // Suggest the prefix format (e.g., "MAT101", "MAT201")
        const remainingChars = normalizedQuery.substring(coursePrefix.length);
        if (remainingChars && /^\d{0,3}$/.test(remainingChars)) {
          // They're typing numbers after prefix
          results.push({
            suggestion: `${coursePrefix}${remainingChars.padEnd(3, 'X')}`.replace(
              /X+$/,
              ''
            ),
            type: 'course',
            confidence: 0.7,
          });
        }
      }
    }

    // 3. Check if query matches a department name
    const departmentMatch = matchesDepartment(normalizedQuery);
    if (departmentMatch && !historyMatches.length) {
      results.push({
        suggestion: departmentMatch,
        type: 'department',
        confidence: 0.75,
      });

      // Also suggest common course codes for this department
      const prefixes = getCourseCodePrefixesForDepartment(departmentMatch);
      prefixes.slice(0, 2).forEach((prefix) => {
        results.push({
          suggestion: `${prefix} - ${departmentMatch}`,
          type: 'course',
          confidence: 0.6,
        });
      });
    }

    // 4. Partial department name matches
    if (!departmentMatch && normalizedQuery.length >= 3) {
      for (const [fullName, aliases] of Object.entries(DEPARTMENT_NAMES)) {
        if (
          fullName.toLowerCase().includes(normalizedQuery.toLowerCase()) ||
          aliases.some((alias) =>
            alias.toLowerCase().includes(normalizedQuery.toLowerCase())
          )
        ) {
          // Avoid duplicates
          if (!results.some((r) => r.suggestion === fullName)) {
            results.push({
              suggestion: fullName,
              type: 'department',
              confidence: 0.5,
            });
          }
        }
      }
    }

    // Sort by confidence (highest first) and remove duplicates
    const uniqueResults = results
      .filter(
        (result, index, self) =>
          index ===
          self.findIndex((r) => r.suggestion.toLowerCase() === result.suggestion.toLowerCase())
      )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Limit to top 5 suggestions

    return uniqueResults;
  }, [enabled, query, minCharacters, searchHistory]);

  /**
   * Get the best suggestion for tab completion (single suggestion)
   */
  const tabCompletion = useMemo((): string | null => {
    if (!suggestions.length) return null;

    // Return the highest confidence suggestion
    const best = suggestions[0];
    return best.suggestion;
  }, [suggestions]);

  /**
   * Check if tab completion should be shown
   */
  const shouldShowTabCompletion = useMemo((): boolean => {
    if (!tabCompletion || !query) return false;

    // Only show if the suggestion starts with the query
    return tabCompletion.toLowerCase().startsWith(query.toLowerCase().trim());
  }, [tabCompletion, query]);

  return {
    suggestions,
    tabCompletion,
    shouldShowTabCompletion,
    saveToHistory,
    clearHistory,
    hasHistory: searchHistory.length > 0,
  };
}

export type { AutocompleteResult };
