import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark } from "@/lib/types/bookmark.types";
import { BookmarkContextType } from "./BookmarkContext";
import { getAllBookmarks } from "@/api/user.api";
import { useAuth } from "@/hooks/useAuth";
import { useToggleBookmark } from "@/hooks/mutations/useBookmarkOperations";
import { queryKeys } from "@/hooks/queries/queryKeys";

const BookmarkContext = createContext<BookmarkContextType | undefined>(
  undefined
);

interface BookmarkProviderProps {
  children: ReactNode;
}

export const BookmarkProvider: React.FC<BookmarkProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toggleBookmarkMutation = useToggleBookmark();

  // Use React Query to fetch and cache bookmarks
  const {
    data: bookmarks = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.bookmarks.list(),
    queryFn: async () => {
      if (!user) return [];
      const data = await getAllBookmarks();
      return data || [];
    },
    enabled: !!user, // Only fetch when user is authenticated
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const [error, setError] = useState<string | null>(null);

  // Update error state from query error
  useEffect(() => {
    if (queryError) {
      setError((queryError as any).message || "Failed to fetch bookmarks");
    } else {
      setError(null);
    }
  }, [queryError]);

  // Check if a material is bookmarked
  const isBookmarked = (materialId: string): boolean => {
    return bookmarks.some((bookmark) => bookmark.materialId === materialId);
  };

  // Toggle bookmark using React Query mutation (with optimistic updates)
  const toggleBookmark = async (materialId: string) => {
    if (!user) return;

    const currentBookmark = bookmarks.find((b) => b.materialId === materialId);

    toggleBookmarkMutation.mutate({
      materialId,
      bookmarkId: currentBookmark?.id,
    });
  };

  // Refresh bookmarks manually
  const refreshBookmarks = async () => {
    await refetch();
  };

  const value: BookmarkContextType = {
    bookmarks,
    isLoading,
    error,
    isBookmarked,
    toggleBookmark,
    refreshBookmarks,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};

// Hook to use bookmark context
export const useBookmarks = (): BookmarkContextType => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
};
