import { httpClient } from "./api";
import {
  Collection,
  CreateCollectionDto,
  UpdateCollectionDto,
} from "@/lib/types/collection.types";
import { Response } from "@/lib/types/response.types";

/**
 * Create a new collection
 * @param collectionData - Collection creation data
 * @returns created collection response or null
 */
export async function createCollection(
  collectionData: CreateCollectionDto
): Promise<Response<Collection> | null> {
  try {
    const response = await httpClient.post("/collections", collectionData);
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to create collection",
    };
  }
}

/**
 * Get current user's collections
 * @param page - Page number
 * @param limit - Items per page
 * @returns paginated collections response
 */
export async function getMyCollections(
  page = 1,
  limit = 10
): Promise<Response<{ data: Collection[]; pagination: any }> | null> {
  try {
    const response = await httpClient.get(
      `/collections/me?page=${page}&limit=${limit}`
    );
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to fetch your collections",
    };
  }
}

/**
 * Get collection by ID
 * @param collectionId - Collection ID
 * @returns collection response or null
 */
export async function getCollection(
  collectionId: string
): Promise<Response<Collection> | null> {
  try {
    const response = await httpClient.get(`/collections/${collectionId}`);
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch collection",
    };
  }
}

/**
 * Get collections by creator
 * @param creatorId - Creator user ID
 * @param page - Page number
 * @param limit - Items per page
 * @returns paginated collections response or null
 */
export async function getCollectionsByCreator(
  creatorId: string,
  page = 1,
  limit = 10
): Promise<Response<{ data: Collection[]; pagination: any }> | null> {
  try {
    const response = await httpClient.get(
      `/collections/user/${creatorId}?page=${page}&limit=${limit}`
    );
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to fetch user collections",
    };
  }
}

/**
 * Update a collection
 * @param collectionId - Collection ID
 * @param updateData - Collection update data
 * @returns updated collection response or null
 */
export async function updateCollection(
  collectionId: string,
  updateData: UpdateCollectionDto
): Promise<Response<Collection> | null> {
  try {
    const response = await httpClient.patch(
      `/collections/${collectionId}`,
      updateData
    );
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to update collection",
    };
  }
}

/**
 * Delete a collection
 * @param collectionId - Collection ID
 * @returns deletion response or null
 */
export async function deleteCollection(
  collectionId: string
): Promise<Response<Collection> | null> {
  try {
    const response = await httpClient.delete(`/collections/${collectionId}`);
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to delete collection",
    };
  }
}

/**
 * Add material to collection
 * @param collectionId - Collection ID
 * @param materialId - Material ID to add
 * @returns response or null
 */
export async function addMaterialToCollection(
  collectionId: string,
  materialId: string
): Promise<Response<any> | null> {
  try {
    const response = await httpClient.post(
      `/collections/${collectionId}/materials`,
      { materialId }
    );
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to add material to collection",
    };
  }
}

/**
 * Remove material from collection
 * @param collectionId - Collection ID
 * @param materialId - Material ID to remove
 * @returns response or null
 */
export async function removeMaterialFromCollection(
  collectionId: string,
  materialId: string
): Promise<Response<any> | null> {
  try {
    const response = await httpClient.delete(
      `/collections/${collectionId}/materials/${materialId}`
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
        "Failed to remove material from collection",
    };
  }
}

/**
 * Add nested collection
 * @param parentId - Parent collection ID
 * @param childId - Child collection ID to add
 * @returns response or null
 */
export async function addNestedCollection(
  parentId: string,
  childId: string
): Promise<Response<any> | null> {
  try {
    const response = await httpClient.post(
      `/collections/${parentId}/collections`,
      { nestedCollectionId: childId }
    );
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to add nested collection",
    };
  }
}

/**
 * Remove nested collection
 * @param parentId - Parent collection ID
 * @param childId - Child collection ID to remove
 * @returns response or null
 */
export async function removeNestedCollection(
  parentId: string,
  childId: string
): Promise<Response<any> | null> {
  try {
    const response = await httpClient.delete(
      `/collections/${parentId}/collections/${childId}`
    );
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to remove nested collection",
    };
  }
}

/**
 * Helper function to process collection content
 * @param collection - Collection to process
 * @returns processed collection with materials and nested collections
 */
export function processCollectionContent(collection: Collection): {
  materials: any[];
  nestedCollections: Collection[];
} {
  const materials: any[] = [];
  const nestedCollections: Collection[] = [];

  if (collection.content) {
    collection.content.forEach((item) => {
      if (item.material) {
        materials.push(item.material);
      }
      if (item.nestedCollection) {
        nestedCollections.push(item.nestedCollection);
      }
    });
  }

  return { materials, nestedCollections };
}
