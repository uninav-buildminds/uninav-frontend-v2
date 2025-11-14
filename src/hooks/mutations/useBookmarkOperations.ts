import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBookmark, deleteBookmark } from "@/api/user.api";
import { queryKeys } from "../queries/queryKeys";
import { Bookmark } from "@/lib/types/bookmark.types";
import { toast } from "sonner";
import { useAuth } from "../useAuth";

/**
 * Toggle Bookmark Mutation with Optimistic Update
 * Updates UI instantly before server confirms
 */
export const useToggleBookmark = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      materialId,
      bookmarkId,
    }: {
      materialId: string;
      bookmarkId?: string;
    }) => {
      if (bookmarkId) {
        // Delete existing bookmark
        await deleteBookmark(bookmarkId);
        return { action: "remove", materialId };
      } else {
        // Create new bookmark
        const newBookmark = await createBookmark({ materialId });
        return { action: "add", materialId, bookmark: newBookmark };
      }
    },

    // Optimistic update - toggles bookmark instantly
    onMutate: async ({ materialId, bookmarkId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bookmarks.all });

      // Snapshot previous bookmarks
      const previousBookmarks = queryClient.getQueryData<Bookmark[]>(
        queryKeys.bookmarks.list()
      );

      if (bookmarkId) {
        // Remove bookmark optimistically
        queryClient.setQueryData<Bookmark[]>(
          queryKeys.bookmarks.list(),
          (old = []) => old.filter((bookmark) => bookmark.id !== bookmarkId)
        );
      } else {
        // Add bookmark optimistically
        const tempBookmark: Bookmark = {
          id: `temp-${Date.now()}`,
          materialId,
          userId: user?.id || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          material: {} as any, // Will be filled by server response
        };

        queryClient.setQueryData<Bookmark[]>(
          queryKeys.bookmarks.list(),
          (old = []) => [...old, tempBookmark]
        );
      }

      return { previousBookmarks };
    },

    // If mutation fails, rollback
    onError: (err, variables, context) => {
      if (context?.previousBookmarks) {
        queryClient.setQueryData(
          queryKeys.bookmarks.list(),
          context.previousBookmarks
        );
      }
      toast.error("Failed to update bookmark. Please try again.");
    },

    // Success notification
    onSuccess: (data) => {
      if (data.action === "add") {
        toast.success("Added to saved materials");
      } else {
        toast.success("Removed from saved materials");
      }
    },

    // Always refetch after error or success to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all });
    },
  });
};

/**
 * Hook to check if a material is bookmarked
 */
export const useIsBookmarked = (materialId: string): boolean => {
  const queryClient = useQueryClient();
  const bookmarks =
    queryClient.getQueryData<Bookmark[]>(queryKeys.bookmarks.list()) || [];

  return bookmarks.some((bookmark) => bookmark.materialId === materialId);
};

/**
 * Hook to get bookmark ID for a material
 */
export const useGetBookmarkId = (materialId: string): string | undefined => {
  const queryClient = useQueryClient();
  const bookmarks =
    queryClient.getQueryData<Bookmark[]>(queryKeys.bookmarks.list()) || [];

  return bookmarks.find((bookmark) => bookmark.materialId === materialId)?.id;
};
