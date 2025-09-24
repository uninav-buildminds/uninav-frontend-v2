import { httpClient } from "./api";
import { UserProfile } from "@/lib/types/user.types";
import { Bookmark } from "@/lib/types/bookmark.types";

export interface FetchAllUsersResponse {
  data: UserProfile[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Fetches the profile of the currently authenticated user
 * @returns user profile data
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function getUserProfile() {
  try {
    const response = await httpClient.get("/user/profile");
    return response.data.data;
  } catch (error) {
    const actualError = error.data.error;
    throw {
      statusCode: actualError.statusCode || 500,
      message:
        actualError.cause || "Fetching user profile failed. Please try again.",
    };
  }
}

/**
 * Updates the user profile
 * @param data - Partial user profile data to update
 * @returns updated user profile data
 */
export async function updateUserProfile(
  data: Partial<
    Pick<
      UserProfile,
      "firstName" | "lastName" | "username" | "level" | "departmentId"
    >
  >
): Promise<UserProfile> {
  try {
    const response = await httpClient.patch("/user", data);
    return response.data.data;
  } catch (error) {
    const actualError = error.data.error;
    throw {
      statusCode: actualError.statusCode || 500,
      message:
        actualError.cause || "Failed to update profile. Please try again.",
    };
  }
}

/**
 * Fetch all users with pagination and search
 * @param page - Page number
 * @param limit - Items per page
 * @param query - Search query
 * @returns paginated users response
 */
export async function fetchAllUsers(
  page = 1,
  limit = 100,
  query = ""
): Promise<FetchAllUsersResponse> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (query) params.append("query", query);

    const response = await httpClient.get(`/user?${params.toString()}`);
    if (response.data.status === "success") {
      return response.data.data;
    }
    return { data: [], total: 0, page, limit };
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch users",
    };
  }
}

/**
 * Get user profile by username
 * @param username - Username to lookup
 * @returns user profile data
 */
export async function getUserProfileByUsername(username: string) {
  try {
    const response = await httpClient.get(
      `/user/user-profile?username=${username}`
    );
    return response.data.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch user profile",
    };
  }
}

// Bookmark management functions
type CreateBookmarkData = {
  materialId?: string;
  collectionId?: string;
};

/**
 * Create a new bookmark
 * @param data - Bookmark data
 * @returns created bookmark or null
 */
export async function createBookmark(
  data: CreateBookmarkData
): Promise<Bookmark | null> {
  try {
    const response = await httpClient.post("/user/bookmarks", data);
    return response.data.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to create bookmark",
    };
  }
}

/**
 * Get all bookmarks for current user
 * @returns array of bookmarks or null
 */
export async function getAllBookmarks(): Promise<Bookmark[] | null> {
  try {
    const response = await httpClient.get("/user/bookmarks");
    return response.data.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch bookmarks",
    };
  }
}

/**
 * Get a specific bookmark by ID
 * @param bookmarkId - Bookmark ID
 * @returns bookmark data or null
 */
export async function getBookmark(
  bookmarkId: string
): Promise<Bookmark | null> {
  try {
    const response = await httpClient.get(`/user/bookmarks/${bookmarkId}`);
    return response.data.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch bookmark",
    };
  }
}

/**
 * Delete a bookmark
 * @param bookmarkId - Bookmark ID to delete
 * @returns true if successful
 */
export async function deleteBookmark(bookmarkId: string): Promise<boolean> {
  try {
    const response = await httpClient.delete(`/user/bookmarks/${bookmarkId}`);
    return response.data.status === "success";
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to delete bookmark",
    };
  }
}

// Course management functions

/**
 * Get user's enrolled courses
 * @returns array of courses
 */
export async function getUserCourses() {
  try {
    const response = await httpClient.get("/user/courses");
    return response.data?.data || [];
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch user courses",
    };
  }
}

/**
 * Add courses to user's enrollment
 * @param courseIds - Array of course IDs to add
 * @returns response data
 */
export async function addUserCourses(courseIds: string[]) {
  try {
    const response = await httpClient.post("/user/courses", { courseIds });
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to add courses",
    };
  }
}

/**
 * Remove courses from user's enrollment
 * @param courseIds - Array of course IDs to remove
 * @returns response data
 */
export async function removeUserCourses(courseIds: string[]) {
  try {
    const response = await httpClient.delete("/user/courses", {
      data: { courseIds },
    });
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to remove courses",
    };
  }
}

/**
 * Get user's blog posts
 * @param creatorId - User ID to get blogs for
 * @returns array of blog posts
 */
export async function getUserBlogs(creatorId: string | undefined) {
  try {
    const response = await httpClient.get(`/blogs/user/${creatorId}`);
    return response.data.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch user blogs",
    };
  }
}
