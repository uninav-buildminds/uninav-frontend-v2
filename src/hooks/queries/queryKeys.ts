/**
 * Centralized Query Keys for React Query
 * This ensures consistent cache invalidation across the app
 */

export const queryKeys = {
  // Course queries
  courses: {
    all: ["courses"] as const,
    lists: () => [...queryKeys.courses.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.courses.lists(), filters] as const,
    details: () => [...queryKeys.courses.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.courses.details(), id] as const,
    paginated: (filters?: Record<string, any>) =>
      [...queryKeys.courses.all, "paginated", filters] as const,
  },

  // Material queries
  materials: {
    all: ["materials"] as const,
    lists: () => [...queryKeys.materials.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.materials.lists(), filters] as const,
    details: () => [...queryKeys.materials.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.materials.details(), id] as const,
    recent: () => [...queryKeys.materials.all, "recent"] as const,
    recommendations: () =>
      [...queryKeys.materials.all, "recommendations"] as const,
    userUploads: (userId?: string) =>
      [...queryKeys.materials.all, "uploads", userId] as const,
  },

  // Bookmark queries
  bookmarks: {
    all: ["bookmarks"] as const,
    list: () => [...queryKeys.bookmarks.all, "list"] as const,
  },

  // DLC (Department-Level-Course) queries
  dlc: {
    all: ["dlc"] as const,
    lists: () => [...queryKeys.dlc.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.dlc.lists(), filters] as const,
  },

  // Blog queries
  blogs: {
    all: ["blogs"] as const,
    lists: () => [...queryKeys.blogs.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.blogs.lists(), filters] as const,
    details: () => [...queryKeys.blogs.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.blogs.details(), id] as const,
  },

  // User queries
  user: {
    all: ["user"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
    courses: () => [...queryKeys.user.all, "courses"] as const,
  },
} as const;
