import { httpClient } from "./api";
import {
  Material,
  MaterialTypeEnum,
  VisibilityEnum,
  RestrictionEnum,
  CreateMaterialDto,
} from "@/lib/types/material.types";
import { Response, PaginatedResponse } from "@/lib/types/response.types";

/**
 * Get recommended materials based on user preferences
 * @param params - Pagination and filter parameters
 * @returns paginated materials response
 */
export async function fetchRecommendedMaterials({
  page = 1,
  limit = 6,
}: {
  page?: number;
  limit?: number;
}): Promise<Response<{ data: Material[]; pagination: any }>> {
  try {
    const response = await httpClient.get(
      `/materials/recommendations?page=${page}&limit=${limit}`
    );
    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(
      response.data.message || "Failed to fetch recommended materials"
    );
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Get materials created by current user
 * @param params - Pagination and filter parameters
 * @returns paginated materials response
 */
export async function getMyMaterials({
  page = 1,
  limit = 10,
  type,
}: {
  page?: number;
  limit?: number;
  type?: MaterialTypeEnum;
}): Promise<Response<{ data: Material[]; pagination: any }>> {
  try {
    let url = `/materials/me?page=${page}&limit=${limit}`;
    if (type) url += `&type=${type}`;

    const response = await httpClient.get(url);
    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to fetch my materials");
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Get materials by creator
 * @param creatorId - Creator user ID
 * @param page - Page number
 * @returns paginated materials response
 */
export async function getMaterialsByCreator(
  creatorId: string,
  page: number = 1
) {
  try {
    const response = await httpClient.get(
      `/materials/user/${creatorId}?page=${page}`
    );
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch materials",
    };
  }
}

/**
 * Search materials when user is logged in
 * @param params - Search parameters
 * @returns paginated materials response
 */
export async function searchMaterialsLoggedIn({
  query,
  page = 1,
  limit = 10,
  creatorId,
  courseId,
  type,
  tag,
  advancedSearch,
}: {
  query?: string;
  page?: number;
  limit?: number;
  creatorId?: string;
  courseId?: string;
  type?: string;
  tag?: string;
  advancedSearch?: boolean;
}): Promise<Response<{ data: Material[]; pagination: any }>> {
  try {
    let url = `/materials/search?page=${page}&limit=${limit}`;

    if (query) url += `&query=${encodeURIComponent(query)}`;
    if (creatorId) url += `&creatorId=${creatorId}`;
    if (courseId) url += `&courseId=${courseId}`;
    if (type) url += `&type=${type}`;
    if (tag) url += `&tag=${tag}`;
    if (advancedSearch) url += `&advancedSearch=${advancedSearch}`;

    const response = await httpClient.get(url);
    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to search materials");
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Search materials when user is not logged in
 * @param params - Search parameters
 * @returns paginated materials response
 */
export async function searchMaterialsNotLoggedIn({
  query,
  page = 1,
  limit = 10,
  creatorId,
  courseId,
  type,
  tag,
  advancedSearch,
}: {
  query?: string;
  page?: number;
  limit?: number;
  creatorId?: string;
  courseId?: string;
  type?: string;
  tag?: string;
  advancedSearch?: boolean;
}): Promise<Response<{ data: Material[]; pagination: any }>> {
  try {
    let url = `/materials?page=${page}&limit=${limit}`;

    if (query) url += `&query=${encodeURIComponent(query)}`;
    if (creatorId) url += `&creatorId=${creatorId}`;
    if (courseId) url += `&courseId=${courseId}`;
    if (type) url += `&type=${type}`;
    if (tag) url += `&tag=${tag}`;
    if (advancedSearch) url += `&advancedSearch=${advancedSearch}`;

    const response = await httpClient.get(url);
    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to search materials");
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Get material by ID
 * @param id - Material ID
 * @returns material data
 */
export async function getMaterialById(id: string): Promise<Response<Material>> {
  try {
    const response = await httpClient.get(`/materials/${id}`);
    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(
      response.data.message || "Failed to fetch material details"
    );
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Create a new material
 * @param materialData - Material creation data
 * @returns created material response
 */
export async function createMaterial(
  materialData: CreateMaterialDto
): Promise<Response<Material>> {
  try {
    const formData = new FormData();

    // Add all text fields
    Object.entries(materialData).forEach(([key, value]) => {
      if (
        key !== "file" &&
        key !== "tags" &&
        key !== "metaData" &&
        value !== undefined
      ) {
        formData.append(key, value.toString());
      }
    });

    // Add arrays as JSON strings
    if (materialData.tags && materialData.tags.length > 0) {
      formData.append("tags", JSON.stringify(materialData.tags));
    }

    if (materialData.metaData && materialData.metaData.length > 0) {
      formData.append("metaData", JSON.stringify(materialData.metaData));
    }

    // Add file if present
    if (materialData.file) {
      formData.append("file", materialData.file);
    }

    const response = await httpClient.post("/materials", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to create material");
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Update an existing material
 * @param id - Material ID
 * @param materialData - Material update data
 * @returns updated material response
 */
export async function updateMaterial(
  id: string,
  materialData: Partial<CreateMaterialDto>
): Promise<Response<Material>> {
  try {
    const formData = new FormData();

    // Add all text fields
    Object.entries(materialData).forEach(([key, value]) => {
      if (
        key !== "file" &&
        key !== "tags" &&
        key !== "metaData" &&
        value !== undefined
      ) {
        formData.append(key, value.toString());
      }
    });

    // Add arrays as JSON strings
    if (materialData.tags && materialData.tags.length > 0) {
      formData.append("tags", JSON.stringify(materialData.tags));
    }

    if (materialData.metaData && materialData.metaData.length > 0) {
      formData.append("metaData", JSON.stringify(materialData.metaData));
    }

    // Add file if present
    if (materialData.file) {
      formData.append("file", materialData.file);
    }

    const response = await httpClient.patch(`/materials/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to update material");
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Delete a material
 * @param id - Material ID
 * @returns deletion response
 */
export async function deleteMaterial(
  id: string
): Promise<Response<{ id: string }>> {
  try {
    const response = await httpClient.delete(`/materials/${id}`);
    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to delete material");
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Toggle like/unlike for a material
 * @param id - Material ID
 * @returns like status response
 */
export async function toggleMaterialLike(
  id: string
): Promise<Response<{ liked: boolean; likesCount: number }>> {
  try {
    const response = await httpClient.post(`/materials/like/${id}`);
    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to toggle material like");
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Get download URL for a material
 * @param id - Material ID
 * @returns download URL response
 */
export async function getMaterialDownloadUrl(
  id: string
): Promise<Response<{ url: string }>> {
  try {
    const response = await httpClient.get(`/materials/download/${id}`);
    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to get download URL");
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Get material resource information
 * @param materialId - Material ID
 * @returns material resource response
 */
export async function getMaterialResource(materialId: string): Promise<
  Response<{
    resourceType: string;
    resourceAddress: string;
    metaData: string[];
    fileKey: string;
  }>
> {
  try {
    const response = await httpClient.get(`/materials/resource/${materialId}`);
    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to get material resource");
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Increment download count for a material
 * @param materialId - Material ID
 */
export async function incrementDownloadCount(
  materialId: string
): Promise<void> {
  try {
    await httpClient.post(`/materials/downloaded/${materialId}`);
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Like or unlike a material (prevents duplicates)
 * @param materialId - Material ID
 * @returns like status response
 */
export async function likeOrUnlikeMaterial(
  materialId: string
): Promise<Response<{ liked: boolean; likesCount: number }>> {
  try {
    const response = await httpClient.post(`/materials/like/${materialId}`);
    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to like/unlike material");
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

/**
 * Get materials with filters
 * @param params - Filter parameters
 * @returns paginated materials response
 */
export async function getMaterials({
  creatorId,
  courseId,
  type,
  tag,
  page = 1,
  limit = 10,
}: {
  creatorId?: string;
  courseId?: string;
  type?: string;
  tag?: string;
  page?: number;
  limit?: number;
}): Promise<Response<{ data: Material[]; pagination: any }>> {
  try {
    let url = `/materials?page=${page}&limit=${limit}`;

    if (creatorId) url += `&creatorId=${creatorId}`;
    if (courseId) url += `&courseId=${courseId}`;
    if (type) url += `&type=${type}`;
    if (tag) url += `&tag=${tag}`;

    const response = await httpClient.get(url);
    if (response.data.status === "success") {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to fetch materials");
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Something went wrong",
    };
  }
}

// Compatibility function for the current create materials implementation
export async function createMaterials(rawForm: any) {
  const materialData: CreateMaterialDto = {
    label: rawForm.materialTitle,
    description: rawForm.description,
    type: "pdf", // or detect from file
    tags: Array.isArray(rawForm.tags) ? rawForm.tags : rawForm.tags.split(","),
    visibility: rawForm.visibility.toLowerCase(),
    restriction: rawForm.accessRestrictions.toLowerCase(),
    file: rawForm.file,
  };

  return createMaterial(materialData);
}

// Compatibility exports
export const getMaterialRecommendations = fetchRecommendedMaterials;
export async function getRecentMaterials() {
  try {
    const response = await httpClient.get("/materials/recent");
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Fetching recent materials failed. Please try again.",
    };
  }
}
