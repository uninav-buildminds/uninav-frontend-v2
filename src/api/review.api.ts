import { httpClient } from "./api";
import { ApprovalStatusEnum, PaginatedResponse, Response, ResponseStatus } from "@/lib/types/response.types";
// Using relative paths to ensure compatibility with bundler path resolution for newly added types
import { Blog } from "../lib/types/blog.types";
import { Course } from "../lib/types/course.types";
import { DLC } from "../lib/types/dlc.types";

// Shared Interfaces
export interface ReviewActionDTO {
  action: ApprovalStatusEnum;
  comment?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: ApprovalStatusEnum | string;
  query?: string;
  type?: string;
}

// Utility to build query string
const buildQuery = (base: string, params: Record<string, any>) => {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
  return query ? `${base}?${query}` : base;
};

// Generic fetcher for paginated reviews
async function fetchPaginated<T>(url: string): Promise<PaginatedResponse<T> | null> {
  try {
    const { data } = await httpClient.get(url);
    return data as PaginatedResponse<T>;
  } catch (error) {
    console.error(`Error fetching: ${url}`, error);
    return null;
  }
}

// Blogs Review
export const listBlogReviews = (params: PaginationParams = {}) => {
  const url = buildQuery("/review/blogs", {
    page: params.page || 1,
    limit: params.limit || 10,
    status: params.status,
    type: params.type,
    query: params.query,
  });
  return fetchPaginated<Blog>(url);
};

export const reviewBlog = async (blogId: string, reviewData: ReviewActionDTO) => {
  const { data } = await httpClient.post<Response<Blog>>(`/review/blogs/review/${blogId}`, reviewData);
  return data;
};

export const deleteBlogAsAdmin = async (blogId: string) => {
  const { data } = await httpClient.delete<Response<{ id: string }>>(`/review/blogs/${blogId}`);
  return data;
};

// Courses Review
export const listCourseReviews = (params: PaginationParams = {}) => {
  const url = buildQuery("/review/courses", {
    page: params.page || 1,
    limit: params.limit || 10,
    status: params.status,
    query: params.query,
  });
  return fetchPaginated<Course>(url);
};

export const reviewCourse = async (courseId: string, reviewData: ReviewActionDTO) => {
  const { data } = await httpClient.post<Response<Course>>(`/review/courses/review/${courseId}`, reviewData);
  return data;
};

export const deleteCourseAsAdmin = async (courseId: string) => {
  const { data } = await httpClient.delete<Response<{ id: string }>>(`/review/courses/${courseId}`);
  return data;
};

// DLC Review
export const listDLCReviews = (params: PaginationParams = {}) => {
  const url = buildQuery("/review/dlc", {
    page: params.page || 1,
    limit: params.limit || 10,
    status: params.status,
    query: params.query,
  });
  return fetchPaginated<DLC>(url);
};

export const reviewDLC = async (departmentId: string, courseId: string, reviewData: ReviewActionDTO) => {
  const { data } = await httpClient.post<Response<DLC>>(`/review/dlc/review/${departmentId}/${courseId}`, reviewData);
  return data;
};

export const deleteDLCAsAdmin = async (departmentId: string, courseId: string) => {
  const { data } = await httpClient.delete<Response<{ departmentId: string; courseId: string }>>(`/review/dlc/${departmentId}/${courseId}`);
  return data;
};

// Counts endpoints (if backend supports them similar to old frontend)
export interface ReviewCounts { pending: number; approved: number; rejected: number; }

export const getBlogReviewCounts = async () => {
  try {
    const { data } = await httpClient.get<Response<ReviewCounts>>("/review/blogs/counts");
    return data.status === ResponseStatus.SUCCESS ? data : null;
  } catch (e) {
    return null;
  }
};

export const getCourseReviewCounts = async () => {
  try {
    const { data } = await httpClient.get<Response<ReviewCounts>>("/review/courses/counts");
    return data.status === ResponseStatus.SUCCESS ? data : null;
  } catch (e) {
    return null;
  }
};

export const getDLCReviewCounts = async () => {
  try {
    const { data } = await httpClient.get<Response<ReviewCounts>>("/review/dlc/counts");
    return data.status === ResponseStatus.SUCCESS ? data : null;
  } catch (e) {
    return null;
  }
};
