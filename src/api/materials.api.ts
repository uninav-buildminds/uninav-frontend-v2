import { PaginatedResponse } from "@/lib/types/response.types";
import { httpClient } from "./api";
import { Material } from "@/api/review.api";

interface MaterialRecommendation {
  page?: number;
  limit?: number;
  query?: string;
  courseId?: string;
  type?: string;
  tag?: string;
  reviewStatus?: string;
  advancedSearch?: boolean;
  ignorePreference?: boolean;
}

interface MaterialSearchParams {
  page?: number;
  limit?: number;
  query?: string;
  creatorId?: string;
  courseId?: string;
  type?: string;
  tag?: string;
  reviewStatus?: string;
  advancedSearch?: boolean; // if to use a more though searching algorithm (should be used if previous didn't find any results)
  ignorePreference?: boolean; // if to ignore the user's preference (should be used if the user is not logged in or admin is searching on management page)
}

export async function createMaterials(rawForm: any) {
  const formData = new FormData();

  formData.append("label", rawForm.materialTitle);
  formData.append("description", rawForm.description);

  const type =
    rawForm.type ||
    (rawForm.file?.name?.split(".").pop()?.toLowerCase() ?? "other");

  const allowedTypes = [
    "docs",
    "pdf",
    "ppt",
    "gdrive",
    "excel",
    "image",
    "video",
    "article",
    "other",
  ];
  formData.append("type", allowedTypes.includes(type) ? type : "other");

  formData.append(
    "restriction",
    rawForm.accessRestrictions
      ? rawForm.accessRestrictions.toLowerCase()
      : "downloadable"
  );

  formData.append(
    "tags",
    Array.isArray(rawForm.tags) ? rawForm.tags.join(",") : rawForm.tags || ""
  );

  if (rawForm.file) {
    formData.append("file", rawForm.file);
  }
  if (rawForm.url) {
    formData.append("resourceAddress", rawForm.url);
  }
  if (rawForm.targetCourseId) {
    formData.append("targetCourseId", rawForm.targetCourseId);
  }
  if (rawForm.metaData) {
    rawForm.metaData.forEach((meta: string) =>
      formData.append("metaData", meta)
    );
  }

  formData.append(
    "visibility",
    rawForm.visibility ? rawForm.visibility.toLowerCase() : "public"
  );

  // 🔍 Debug
  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    const response = await httpClient.post("/materials", formData);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        "Material upload failed. Please try again.",
    };
  }
}

export async function getMaterialRecommendations(
  params: MaterialRecommendation
) {
  try {
    const response = await httpClient.get("/materials/recommendations", {
      params,
    });
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        "Fetching material recommendations failed. Please try again.",
    };
  }
}

export async function getRecentMaterials() {
  try {
    const response = await httpClient.get("/materials/recent");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching recent materials:", error);
    throw {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        "Fetching recent materials failed. Please try again.",
    };
  }
}

// Search materials with pagination and filtering
export async function searchMaterials(
  params: MaterialSearchParams
): Promise<PaginatedResponse<Material>> {
  try {
    const response = await httpClient.get("/materials", {
      params,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error searching materials:", error);
    throw {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        "Searching materials failed. Please try again.",
    };
  }
}
