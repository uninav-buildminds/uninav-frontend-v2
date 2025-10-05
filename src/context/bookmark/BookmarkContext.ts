import { Bookmark } from "@/lib/types/bookmark.types";

export interface BookmarkContextType {
  bookmarks: Bookmark[];
  isLoading: boolean;
  error: string | null;
  isBookmarked: (materialId: string) => boolean;
  toggleBookmark: (materialId: string) => Promise<void>;
  refreshBookmarks: () => Promise<void>;
}
