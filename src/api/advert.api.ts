import { httpClient } from "./api";
import { Advert, CreateFreeAdvertDto } from "@/lib/types/advert.types";
import { Response } from "@/lib/types/response.types";

/**
 * Create a new free advertisement
 * @param advertData - Advertisement creation data
 * @returns created advert response or null
 */
export async function createFreeAdvert(
  advertData: CreateFreeAdvertDto
): Promise<Response<Advert> | null> {
  try {
    const formData = new FormData();

    // Add text fields
    Object.entries(advertData).forEach(([key, value]) => {
      if (key !== "image" && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // Add image if present
    if (advertData.image) {
      formData.append("image", advertData.image);
    }

    const response = await httpClient.post("/adverts/free-advert", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to create advertisement",
    };
  }
}

/**
 * Get all advertisements
 * @returns adverts response or null
 */
export async function getAllAdverts(): Promise<Response<Advert[]> | null> {
  try {
    const response = await httpClient.get("/adverts");
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to fetch advertisements",
    };
  }
}

/**
 * Get advertisement by ID
 * @param advertId - Advertisement ID
 * @returns advert response or null
 */
export async function getAdvertById(
  advertId: string
): Promise<Response<Advert> | null> {
  try {
    const response = await httpClient.get(`/adverts/${advertId}`);
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch advertisement",
    };
  }
}

/**
 * Update an advertisement
 * @param advertId - Advertisement ID
 * @param data - Update data
 * @returns updated advert response or null
 */
export async function updateAdvert(
  advertId: string,
  data: Partial<CreateFreeAdvertDto>
): Promise<Response<Advert> | null> {
  try {
    const formData = new FormData();

    // Add text fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "image" && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // Add image if present
    if (data.image) {
      formData.append("image", data.image);
    }

    const response = await httpClient.patch(`/adverts/${advertId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to update advertisement",
    };
  }
}

/**
 * Delete an advertisement
 * @param advertId - Advertisement ID
 * @returns deletion response or null
 */
export async function deleteAdvert(
  advertId: string
): Promise<Response<Advert> | null> {
  try {
    const response = await httpClient.delete(`/adverts/${advertId}`);
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to delete advertisement",
    };
  }
}

/**
 * Get advertisements by material ID
 * @param materialId - Material ID
 * @returns adverts response or null
 */
export async function getAdvertByMaterialId(
  materialId: string
): Promise<Response<Advert[]> | null> {
  try {
    const response = await httpClient.get(`/adverts/material/${materialId}`);
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Failed to fetch material advertisements",
    };
  }
}

/**
 * Get advertisements by collection ID
 * @param collectionId - Collection ID
 * @returns adverts response or null
 */
export async function getAdvertByCollectionId(
  collectionId: string
): Promise<Response<Advert[]> | null> {
  try {
    const response = await httpClient.get(
      `/adverts/collection/${collectionId}`
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
        "Failed to fetch collection advertisements",
    };
  }
}

/**
 * Get current user's advertisements
 * @returns adverts response or null
 */
export async function getMyAdverts(): Promise<Response<Advert[]> | null> {
  try {
    const response = await httpClient.get("/adverts/me");
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to fetch your advertisements",
    };
  }
}

/**
 * Get advertisements by creator ID
 * @param creatorId - Creator user ID
 * @returns adverts response or null
 */
export async function getAdvertsByCreatorId(
  creatorId: string
): Promise<Response<Advert[]> | null> {
  try {
    const response = await httpClient.get(`/adverts/user/${creatorId}`);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Failed to fetch creator's advertisements",
    };
  }
}

/**
 * Increment click count for an advertisement
 * @param id - Advertisement ID
 */
export async function incrementClick(id: string): Promise<void> {
  try {
    await httpClient.post(`/adverts/click/${id}`);
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to record click",
    };
  }
}
