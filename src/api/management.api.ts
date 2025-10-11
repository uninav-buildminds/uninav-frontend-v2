import { httpClient } from "./api";
import { Response } from "@/lib/types/response.types";

export interface ManagementStats {
  pendingReviews: number;
  approvedToday: number;
  rejectedItems: number;
  totalViews: number;
  materialsPending: number;
  blogsPending: number;
  coursesPending: number;
  dlcPending: number;
  advertsPending: number;
  moderatorsPending: number;
}

export interface ReviewCounts {
  materials: {
    pending: number;
    approved: number;
    rejected: number;
  };
  blogs: {
    pending: number;
    approved: number;
    rejected: number;
  };
  courses: {
    pending: number;
    approved: number;
    rejected: number;
  };
  dlc: {
    pending: number;
    approved: number;
    rejected: number;
  };
  adverts: {
    pending: number;
    approved: number;
    rejected: number;
  };
  moderators: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

/**
 * Get management dashboard statistics
 */
export async function getManagementStats(): Promise<Response<ManagementStats>> {
  try {
    const response = await httpClient.get("/management/stats");
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to fetch management stats",
    };
  }
}

/**
 * Get review counts for all content types
 */
export async function getReviewCounts(): Promise<Response<ReviewCounts>> {
  try {
    const response = await httpClient.get("/management/review-counts");
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch review counts",
    };
  }
}

/**
 * Get materials review count
 */
export async function getMaterialsReviewCount(
  departmentId?: string
): Promise<Response<{ pending: number; approved: number; rejected: number }>> {
  try {
    const response = await httpClient.get("/review/materials/count", {
      params: departmentId ? { departmentId } : {},
    });
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Failed to fetch materials review count",
    };
  }
}

/**
 * Get blogs review count
 */
export async function getBlogsReviewCount(
  departmentId?: string
): Promise<Response<{ pending: number; approved: number; rejected: number }>> {
  try {
    const response = await httpClient.get("/review/blogs/count", {
      params: departmentId ? { departmentId } : {},
    });
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to fetch blogs review count",
    };
  }
}

/**
 * Get courses review count
 */
export async function getCoursesReviewCount(
  departmentId?: string
): Promise<Response<{ pending: number; approved: number; rejected: number }>> {
  try {
    const response = await httpClient.get("/review/courses/count", {
      params: departmentId ? { departmentId } : {},
    });
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to fetch courses review count",
    };
  }
}
