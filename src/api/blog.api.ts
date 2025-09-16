import { httpClient } from "./api";
import { Blog } from "@/lib/types/blog.types";
import { Response, PaginatedResponse } from "@/lib/types/response.types";

export enum BlogType {
  ARTICLE = "article",
  NEWS = "news",
  TUTORIAL = "tutorial",
  OPINION = "opinion",
  REVIEW = "review",
}

/**
 * Create a new blog
 * @param fileInput - FormData containing blog data and optional image
 * @returns created blog response
 */
export async function createBlog(fileInput: FormData): Promise<Response<Blog>> {
  try {
    const response = await httpClient.post("/blogs", fileInput, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to create blog");
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Search blogs with optional filters
 * @param filters - Search filters
 * @returns paginated blogs response
 */
export async function searchBlogs(filters?: {
  query?: string;
  page?: number;
  type?: BlogType;
}): Promise<Response<{ data: Blog[]; pagination: any }>> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filters?.query) params.append("query", filters.query);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.type) params.append("type", filters.type);

    const url = `/blogs${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await httpClient.get(url);

    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Update an existing blog
 * @param fileInput - FormData containing updated blog data
 * @param id - Blog ID
 * @returns updated blog response
 */
export async function editBlog(
  fileInput: FormData,
  id: string
): Promise<Response<Blog>> {
  try {
    const response = await httpClient.patch(`/blogs/${id}`, fileInput, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to update blog");
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Delete a blog
 * @param blogId - Blog ID
 */
export async function deleteBlog(blogId: string): Promise<void> {
  try {
    const response = await httpClient.delete(`/blogs/${blogId}`);
    if (response.data.status !== "success") {
      throw new Error(response.data.message || "Failed to delete blog");
    }
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Get blog by ID
 * @param blogId - Blog ID
 * @returns blog response
 */
export async function getBlogById(blogId: string): Promise<Response<Blog>> {
  try {
    const response = await httpClient.get(`/blogs/${blogId}`);
    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to fetch blog details");
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Get blogs for a specific creator (with browser caching)
 * @param creatorId - Creator user ID
 * @returns blogs response
 */
export async function getBlogByCreatorId(
  creatorId: string
): Promise<Response<Blog[]>> {
  try {
    const response = await httpClient.get(`/blogs/user/${creatorId}`);
    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to fetch user blogs");
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Get current user's blogs
 * @param filters - Pagination filters
 * @returns paginated user blogs response
 */
export async function getUserBlogs(filters?: {
  page?: number;
  limit?: number;
}): Promise<Response<{ data: Blog[]; pagination: any }>> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const url = `/blogs/me${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await httpClient.get(url);

    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to fetch your blogs");
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Toggle like/unlike for a blog
 * @param id - Blog ID
 * @returns like status response
 */
export async function toggleBlogLike(
  id: string
): Promise<Response<{ liked: boolean; likesCount: number }>> {
  try {
    const response = await httpClient.post(`/blogs/like/${id}`);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}
