import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

interface UseUrlStateOptions {
  defaultTab?: string;
  defaultPage?: number;
  defaultQuery?: string;
}

export const useUrlState = (options: UseUrlStateOptions = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    defaultTab = "PENDING",
    defaultPage = 1,
    defaultQuery = "",
  } = options;

  // Get initial values from URL or use defaults
  const getInitialTab = () => searchParams.get("tab") || defaultTab;
  const getInitialPage = () =>
    parseInt(searchParams.get("page") || defaultPage.toString(), 10);
  const getInitialQuery = () => searchParams.get("query") || defaultQuery;

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [searchQuery, setSearchQuery] = useState(getInitialQuery);

  // Update URL when state changes
  const updateUrl = useCallback(
    (updates: { tab?: string; page?: number; query?: string }) => {
      const newParams = new URLSearchParams(searchParams);

      if (updates.tab !== undefined) {
        if (updates.tab === defaultTab) {
          newParams.delete("tab");
        } else {
          newParams.set("tab", updates.tab);
        }
      }

      if (updates.page !== undefined) {
        if (updates.page === defaultPage) {
          newParams.delete("page");
        } else {
          newParams.set("page", updates.page.toString());
        }
      }

      if (updates.query !== undefined) {
        if (updates.query === defaultQuery) {
          newParams.delete("query");
        } else {
          newParams.set("query", updates.query);
        }
      }

      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams, defaultTab, defaultPage, defaultQuery]
  );

  // Handle tab change
  const handleTabChange = useCallback(
    (newTab: string) => {
      setActiveTab(newTab);
      setCurrentPage(1); // Reset to first page when changing tabs
      updateUrl({ tab: newTab, page: 1 });
    },
    [updateUrl]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      updateUrl({ page: newPage });
    },
    [updateUrl]
  );

  // Handle search query change
  const handleSearchChange = useCallback(
    (newQuery: string) => {
      setSearchQuery(newQuery);
      setCurrentPage(1); // Reset to first page when searching
      updateUrl({ query: newQuery, page: 1 });
    },
    [updateUrl]
  );

  // Sync state with URL changes (for browser back/forward)
  useEffect(() => {
    const urlTab = searchParams.get("tab") || defaultTab;
    const urlPage = parseInt(
      searchParams.get("page") || defaultPage.toString(),
      10
    );
    const urlQuery = searchParams.get("query") || defaultQuery;

    if (urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams, defaultTab, defaultPage, defaultQuery]);

  return {
    activeTab,
    currentPage,
    searchQuery,
    handleTabChange,
    handlePageChange,
    handleSearchChange,
    setSearchQuery, // For direct updates without URL change
  };
};
