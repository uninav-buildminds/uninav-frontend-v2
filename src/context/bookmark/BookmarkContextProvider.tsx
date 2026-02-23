import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Bookmark } from "@/lib/types/bookmark.types";
import { BookmarkContextType } from "./BookmarkContext";
import {
  getBookmarksLite,
  createBookmark,
  deleteBookmark,
} from "@/api/user.api";
import { useAuth } from "@/hooks/useAuth";

const BookmarkContext = createContext<BookmarkContextType | undefined>(
  undefined
);

interface BookmarkProviderProps {
  children: ReactNode;
}

export const BookmarkProvider: React.FC<BookmarkProviderProps> = ({
  children,
}) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch all bookmarks when user is authenticated
  const fetchBookmarks = async () => {
    if (!user) {
      setBookmarks([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bookmarksData = await getBookmarksLite();
      setBookmarks(bookmarksData || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch bookmarks");
      console.error("Error fetching bookmarks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if a material is bookmarked
  const isBookmarked = (materialId: string): boolean => {
    return bookmarks.some((bookmark) => bookmark.materialId === materialId);
  };

  // Toggle bookmark with optimistic update
  const toggleBookmark = async (materialId: string) => {
    if (!user) return;

    const isCurrentlyBookmarked = isBookmarked(materialId);

    // Optimistic update
    if (isCurrentlyBookmarked) {
      // Remove bookmark optimistically
      setBookmarks((prev) =>
        prev.filter((bookmark) => bookmark.materialId !== materialId)
      );
    } else {
      // Add bookmark optimistically
      const tempBookmark: Bookmark = {
        id: `temp-${Date.now()}`, // Temporary ID
        materialId,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setBookmarks((prev) => [...prev, tempBookmark]);
    }

    try {
      if (isCurrentlyBookmarked) {
        // Find and delete the actual bookmark
        const bookmarkToDelete = bookmarks.find(
          (bookmark) => bookmark.materialId === materialId
        );
        if (bookmarkToDelete) {
          await deleteBookmark(bookmarkToDelete.id);
        }
      } else {
        // Create new bookmark
        await createBookmark({ materialId });
      }

      // Refresh bookmarks to get the actual data from server
      await fetchBookmarks();
    } catch (err: any) {
      // Revert optimistic update on error
      await fetchBookmarks();
      console.error("Error toggling bookmark:", err);
    }
  };

  // Refresh bookmarks manually
  const refreshBookmarks = async () => {
    await fetchBookmarks();
  };

  // Fetch bookmarks when user changes
  useEffect(() => {
    fetchBookmarks();
  }, [user]);

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
