import { httpClient } from "./api";
import {
  ReviewActionDTO,
  PaginationParams,
  ReviewCounts,
  ModeratorApplication,
} from "@/lib/types/review.types";
import {
  ApprovalStatusEnum,
  Response,
  PaginatedResponse,
} from "@/lib/types/response.types";
import { Material } from "@/lib/types/material.types";
import { Blog } from "@/lib/types/blog.types";
import { Course } from "@/lib/types/course.types";
import { DLC } from "@/lib/types/dlc.types";
import { Advert } from "@/lib/types/advert.types";

// Utility to build query string
const buildQuery = (base: string, params: Record<string, any>) => {
  const query = Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");
  return query ? `${base}?${query}` : base;
};

// Generic fetcher for paginated reviews
async function fetchPaginated<T>(
  url: string
): Promise<PaginatedResponse<T> | null> {
  try {
    const { data } = await httpClient.get(url);
    return data as PaginatedResponse<T>;
  } catch (error) {
    console.error(`Error fetching: ${url}`, error);
    return null;
  }
}

// Materials Review Endpoints
export async function getMaterialReviews(
  params: PaginationParams & { type?: string } = {}
) {
  try {
    let url = `/review/materials?page=${params.page || 1}&limit=${
      params.limit || 10
    }`;
    if (params.status) url += `&status=${params.status}`;
    if (params.type) url += `&type=${params.type}`;
    if (params.query) url += `&query=${encodeURIComponent(params.query)}`;

    const response = await httpClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching material reviews:", error);
    return null;
  }
}

export async function reviewMaterial(
  materialId: string,
  reviewData: ReviewActionDTO
) {
  try {
    const response = await httpClient.post(
      `/review/materials/review/${materialId}`,
      reviewData
    );
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to review material",
    };
  }
}

export async function deleteMaterialAsAdmin(materialId: string) {
  try {
    const response = await httpClient.delete(`/review/materials/${materialId}`);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to delete material",
    };
  }
}

// Blogs Review Endpoints
export async function listBlogReviews(
  params: PaginationParams & { type?: string } = {}
) {
  try {
    let url = `/review/blogs?page=${params.page || 1}&limit=${
      params.limit || 10
    }`;
    if (params.status) url += `&status=${params.status}`;
    if (params.type) url += `&type=${params.type}`;
    if (params.query) url += `&query=${encodeURIComponent(params.query)}`;

    const response = await httpClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching blog reviews:", error);
    return null;
  }
}

export async function reviewBlog(blogId: string, reviewData: ReviewActionDTO) {
  try {
    const response = await httpClient.post(
      `/review/blogs/review/${blogId}`,
      reviewData
    );
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to review blog",
    };
  }
}

export async function deleteBlogAsAdmin(blogId: string) {
  try {
    const response = await httpClient.delete(`/review/blogs/${blogId}`);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to delete blog",
    };
  }
}

// Courses Review Endpoints
export async function listCourseReviews(params: PaginationParams = {}) {
  try {
    let url = `/review/courses?page=${params.page || 1}&limit=${
      params.limit || 10
    }`;
    if (params.status) url += `&status=${params.status}`;
    if (params.query) url += `&query=${encodeURIComponent(params.query)}`;

    const response = await httpClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching course reviews:", error);
    return null;
  }
}

export async function reviewCourse(
  courseId: string,
  reviewData: ReviewActionDTO
) {
  try {
    const response = await httpClient.post(
      `/review/courses/review/${courseId}`,
      reviewData
    );
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to review course",
    };
  }
}

export async function deleteCourseAsAdmin(courseId: string) {
  try {
    const response = await httpClient.delete(`/review/courses/${courseId}`);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to delete course",
    };
  }
}

// Department Level Courses (DLC) Review Endpoints
export async function listDLCReviews(params: PaginationParams = {}) {
  try {
    let url = `/review/dlc?page=${params.page || 1}&limit=${
      params.limit || 10
    }`;
    if (params.status) url += `&status=${params.status}`;
    if (params.query) url += `&query=${encodeURIComponent(params.query)}`;

    const response = await httpClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching DLC reviews:", error);
    return null;
  }
}

export async function reviewDLC(
  departmentId: string,
  courseId: string,
  reviewData: ReviewActionDTO
) {
  try {
    const response = await httpClient.post(
      `/review/dlc/review/${departmentId}/${courseId}`,
      reviewData
    );
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to review DLC",
    };
  }
}

export async function deleteDLCAsAdmin(departmentId: string, courseId: string) {
  try {
    const response = await httpClient.delete(
      `/review/dlc/${departmentId}/${courseId}`
    );
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to delete DLC",
    };
  }
}

// Moderator Review Endpoints (Admin Only)
export async function listModeratorApplications(params: PaginationParams = {}) {
  try {
    let url = `/review/moderators?page=${params.page || 1}&limit=${
      params.limit || 10
    }`;
    if (params.status) url += `&status=${params.status}`;
    if (params.query) url += `&query=${encodeURIComponent(params.query)}`;

    const response = await httpClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching moderator applications:", error);
    return null;
  }
}

export async function reviewModeratorApplication(
  userId: string,
  reviewData: ReviewActionDTO
) {
  try {
    const response = await httpClient.post(
      `/review/moderators/review/${userId}`,
      reviewData
    );
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Failed to review moderator application",
    };
  }
}

// Advertisements Review Endpoints
export async function listAdvertReviews(
  params: PaginationParams & { type?: string } = {}
) {
  try {
    let url = `/review/adverts?page=${params.page || 1}&limit=${
      params.limit || 10
    }`;
    if (params.status) url += `&status=${params.status}`;
    if (params.type) url += `&type=${params.type}`;
    if (params.query) url += `&query=${encodeURIComponent(params.query)}`;

    const response = await httpClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching advert reviews:", error);
    return null;
  }
}

export async function reviewAdvert(
  advertId: string,
  reviewData: ReviewActionDTO
) {
  try {
    const response = await httpClient.post(
      `/review/adverts/review/${advertId}`,
      reviewData
    );
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to review advertisement",
    };
  }
}

export async function deleteAdvertAsAdmin(advertId: string) {
  try {
    const response = await httpClient.delete(`/review/adverts/${advertId}`);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to delete advertisement",
    };
  }
}

// Review Count Endpoints
export async function getMaterialReviewCounts(departmentId?: string) {
  try {
    const url = `/review/materials/count${
      departmentId ? `?departmentId=${departmentId}` : ""
    }`;
    const response = await httpClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching material review counts:", error);
    return null;
  }
}

export async function getBlogReviewCounts(departmentId?: string) {
  try {
    const url = `/review/blogs/count${
      departmentId ? `?departmentId=${departmentId}` : ""
    }`;
    const response = await httpClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching blog review counts:", error);
    return null;
  }
}

export async function getCourseReviewCounts(departmentId?: string) {
  try {
    const url = `/review/courses/count${
      departmentId ? `?departmentId=${departmentId}` : ""
    }`;
    const response = await httpClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching course review counts:", error);
    return null;
  }
}

export async function getDLCReviewCounts(departmentId?: string) {
  try {
    const url = `/review/dlc/count${
      departmentId ? `?departmentId=${departmentId}` : ""
    }`;
    const response = await httpClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching DLC review counts:", error);
    return null;
  }
}

export async function getModeratorReviewCounts(departmentId?: string) {
  try {
    const url = `/review/moderators/count${
      departmentId ? `?departmentId=${departmentId}` : ""
    }`;
    const response = await httpClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching moderator review counts:", error);
    return null;
  }
}

export async function getAdvertReviewCounts(departmentId?: string) {
  try {
    const url = `/review/adverts/count${
      departmentId ? `?departmentId=${departmentId}` : ""
    }`;
    const response = await httpClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching advertisement review counts:", error);
    return null;
  }
}

// Export types for use in components
export type { Material, Blog, Course, DLC, Advert };
