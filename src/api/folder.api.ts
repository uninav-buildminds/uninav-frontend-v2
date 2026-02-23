import { httpClient } from "./api";
import { Response } from "@/lib/types/response.types";

// Folder type matching backend structure
export interface Folder {
  id: string;
  slug: string;
  label: string;
  description?: string;
  visibility: "public" | "private";
  targetCourseId?: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  content?: Array<{
    id: string;
    folderId: string;
    contentMaterialId?: string;
    contentFolderId?: string;
    material?: any;
    nestedFolder?: Folder;
    createdAt: string;
    updatedAt: string;
  }>;
  likes: number;
  views: number;
  lastViewedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Optional stats attached by backend for convenience
  materialCount?: number;
  nestedFolderCount?: number;
}

export interface FolderStats {
  materialCount: number;
  nestedFolderCount: number;
}

export interface CreateFolderDto {
  label: string;
  description?: string;
  visibility?: "public" | "private";
  targetCourseId?: string;
}

export interface UpdateFolderDto extends Partial<CreateFolderDto> {}

/**
 * Create a new folder
 * @param folderData - Folder creation data
 * @returns created folder response or null
 */
export async function createFolder(
  folderData: CreateFolderDto
): Promise<Response<Folder> | null> {
  try {
    const response = await httpClient.post("/folders", folderData);
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to create folder",
    };
  }
}

/**
 * Get current user's folders
 * @returns folders response
 */
export async function getMyFolders(): Promise<Response<Folder[]> | null> {
  try {
    const response = await httpClient.get("/folders");
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch your folders",
    };
  }
}

/**
 * Get material IDs that are in any of the current user's folders (for list UIs)
 * @returns array of material IDs or null
 */
export async function getFolderMaterialIds(): Promise<
  Response<{ materialIds: string[] }> | null
> {
  try {
    const response = await httpClient.get("/folders/material-ids");
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Failed to fetch material IDs in folders",
    };
  }
}

/**
 * Get current user's folders with pagination
 * @param params - Pagination parameters
 * @returns paginated folders response or null
 */
export async function getMyFoldersPaginated(params: {
  page?: number;
  limit?: number;
}): Promise<
  Response<{
    items: Folder[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasMore: boolean;
      hasPrev: boolean;
    };
  }> | null
> {
  const { page = 1, limit = 10 } = params;
  try {
    const response = await httpClient.get("/folders", {
      params: { page, limit },
    });
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch your folders",
    };
  }
}

/**
 * Get folder by slug
 * @param slug - Folder slug
 * @returns folder response or null
 */
export async function getFolderBySlug(
  slug: string
): Promise<Response<Folder> | null> {
  try {
    const response = await httpClient.get(`/folders/${slug}`);
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch folder",
    };
  }
}

/**
 * Get folder by ID (for backward compatibility with internal operations)
 * @param folderId - Folder ID
 * @returns folder response or null
 */
export async function getFolder(
  folderId: string
): Promise<Response<Folder> | null> {
  try {
    const response = await httpClient.get(`/folders/${folderId}`);
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch folder",
    };
  }
}

/**
 * Get folder stats (material and nested folder counts)
 * @param folderId - Folder ID
 * @returns stats response or null
 */
export async function getFolderStats(
  folderId: string
): Promise<Response<FolderStats> | null> {
  try {
    const response = await httpClient.get(`/folders/stats/${folderId}`);
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch folder stats",
    };
  }
}

/**
 * Get folders by creator
 * @param creatorId - Creator user ID
 * @returns folders response or null
 */
export async function getFoldersByCreator(
  creatorId: string
): Promise<Response<Folder[]> | null> {
  try {
    const response = await httpClient.get(`/folders/by-creator/${creatorId}`);
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch user folders",
    };
  }
}

/**
 * Update a folder
 * @param folderId - Folder ID
 * @param updateData - Folder update data
 * @returns updated folder response or null
 */
export async function updateFolder(
  folderId: string,
  updateData: UpdateFolderDto
): Promise<Response<Folder> | null> {
  try {
    const response = await httpClient.patch(`/folders/${folderId}`, updateData);
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to update folder",
    };
  }
}

/**
 * Delete a folder
 * @param folderId - Folder ID
 * @returns deletion response or null
 */
export async function deleteFolder(
  folderId: string
): Promise<Response<Folder> | null> {
  try {
    const response = await httpClient.delete(`/folders/${folderId}`);
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to delete folder",
    };
  }
}

/**
 * Add material to folder
 * @param folderId - Folder ID
 * @param materialId - Material ID to add
 * @returns response or null
 */
export async function addMaterialToFolder(
  folderId: string,
  materialId: string
): Promise<Response<any> | null> {
  try {
    const response = await httpClient.post(`/folders/${folderId}/materials`, {
      materialId,
    });
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to add material to folder",
    };
  }
}

/**
 * Remove material from folder
 * @param folderId - Folder ID
 * @param materialId - Material ID to remove
 * @returns response or null
 */
export async function removeMaterialFromFolder(
  folderId: string,
  materialId: string
): Promise<Response<any> | null> {
  try {
    const response = await httpClient.delete(
      `/folders/${folderId}/materials/${materialId}`
    );
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Failed to remove material from folder",
    };
  }
}

/**
 * Add nested folder
 * @param parentId - Parent folder ID
 * @param childId - Child folder ID to add
 * @returns response or null
 */
export async function addNestedFolder(
  parentId: string,
  childId: string
): Promise<Response<any> | null> {
  try {
    const response = await httpClient.post(`/folders/${parentId}/folders`, {
      folderId: childId,
    });
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to add nested folder",
    };
  }
}

/**
 * Remove nested folder
 * @param parentId - Parent folder ID
 * @param childId - Child folder ID to remove
 * @returns response or null
 */
export async function removeNestedFolder(
  parentId: string,
  childId: string
): Promise<Response<any> | null> {
  try {
    const response = await httpClient.delete(
      `/folders/${parentId}/folders/${childId}`
    );
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to remove nested folder",
    };
  }
}

/**
 * Search folders by query
 * @param params - Search parameters
 * @returns search results response or null
 */
export async function searchFolders(params: {
  query: string;
  page?: number;
  limit?: number;
}): Promise<Response<{
  items: Folder[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
    hasPrev: boolean;
  };
}> | null> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.append("query", params.query);
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());

    const response = await httpClient.get(
      `/folders/search?${searchParams.toString()}`
    );
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to search folders",
    };
  }
}

/**
 * Get folders containing a specific material
 * @param materialId - Material ID
 * @returns folders response or null
 */
export async function getFoldersByMaterial(
  materialId: string
): Promise<Response<Folder[]> | null> {
  try {
    const response = await httpClient.get(`/folders/by-material/${materialId}`);
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Failed to fetch folders containing material",
    };
  }
}
