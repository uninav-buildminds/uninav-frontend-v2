import { PaginatedResponse, Response } from "@/lib/types/response.types";
import { httpClient } from "./api";
import {
  Material,
  MaterialTypeEnum,
  VisibilityEnum,
  RestrictionEnum,
} from "@/lib/types/material.types";
import { ApprovalStatusEnum as ApprovalStatus } from "@/lib/types/response.types";

// Re-export types for convenience
export type {
  MaterialTypeEnum,
  VisibilityEnum,
  RestrictionEnum,
} from "@/lib/types/material.types";
export type { ApprovalStatusEnum as ApprovalStatus } from "@/lib/types/response.types";

// Form data interface for file uploads
export interface CreateMaterialFileForm {
  materialTitle: string;
  description?: string;
  type?: MaterialTypeEnum;
  classification?: string;
  visibility: VisibilityEnum;
  accessRestrictions: RestrictionEnum;
  tags?: string[];
  targetCourseId?: string;
  metaData?: string[];
  file: File;
  image?: File; // Optional preview image
  filePreview?: File; // Base64 or blob URL for preview
}

// Form data interface for link/URL uploads
export interface CreateMaterialLinkForm {
  materialTitle: string;
  description?: string;
  type?: MaterialTypeEnum;
  classification?: string;
  visibility: VisibilityEnum;
  accessRestrictions: RestrictionEnum;
  tags?: string[];
  targetCourseId?: string;
  metaData?: string[];
  url: string;
  image?: File; // Optional preview image
  previewUrl?: string; // direct url for preview useful for links (YouTube, Google Drive, etc.)

  filePreview?: File | string; // Base64 or blob URL for preview,if specified overrides previewUrl useful for files (PDF, DOCX, etc.)
}

// Union type for all material creation forms
export type CreateMaterialForm =
  | CreateMaterialFileForm
  | CreateMaterialLinkForm;

interface MaterialRecommendation {
  page?: number;
  limit?: number;
  query?: string;
  courseId?: string;
  type?: MaterialTypeEnum;
  tag?: string;
  reviewStatus?: ApprovalStatus;
  advancedSearch?: boolean;
  ignorePreference?: boolean;
}
export async function materialPreview(
  materialId: string,
  previewFile: File | Blob
) {
  const formData = new FormData();
  formData.append("preview", previewFile, "preview.png"); // give it a name

  try {
    const response = await httpClient.post(
      `/materials/preview/upload/${materialId}`,
      formData
    );
    return response;
  } catch (error: any) {
    throw {
      statusCode: error?.status,
      message: error || "Material preview failed. Please try again.",
    };
  }
}

interface MaterialSearchParams {
  page?: number;
  limit?: number;
  query?: string;
  creatorId?: string;
  courseId?: string;
  type?: MaterialTypeEnum;
  tag?: string;
  reviewStatus?: ApprovalStatus;
  advancedSearch?: boolean; // if to use a more though searching algorithm (should be used if previous didn't find any results)
  ignorePreference?: boolean; // if to ignore the user's preference (should be used if the user is not logged in or admin is searching on management page)
}

export async function createMaterials(materialData: CreateMaterialForm) {
  const formData = new FormData();

  formData.append("label", materialData.materialTitle);
  formData.append("description", materialData.description);

  // Type is now inferred and passed from the form, with proper validation
  const type: MaterialTypeEnum = materialData.type || MaterialTypeEnum.OTHER;
  formData.append("type", type);

  // Ensure restriction matches backend enum values
  const restriction: RestrictionEnum =
    materialData.accessRestrictions || RestrictionEnum.DOWNLOADABLE;
  formData.append("restriction", restriction);

  formData.append(
    "tags",
    Array.isArray(materialData.tags)
      ? materialData.tags.join(",")
      : materialData.tags || ""
  );

  // Handle file upload (for CreateMaterialFileForm)
  if ("file" in materialData && materialData.file) {
    formData.append("file", materialData.file);
  }
  // Handle URL/link (for CreateMaterialLinkForm)
  if ("url" in materialData && materialData.url) {
    formData.append("resourceAddress", materialData.url);
  }
  if (materialData.targetCourseId) {
    formData.append("targetCourseId", materialData.targetCourseId);
  }
  if (materialData.metaData) {
    materialData.metaData.forEach((meta: string) =>
      formData.append("metaData", meta)
    );
  }

  // Ensure visibility matches backend enum values
  const visibility: VisibilityEnum =
    materialData.visibility || VisibilityEnum.PUBLIC;
  formData.append("visibility", visibility);

  // Handle preview URL (for link-based materials with string preview URLs)
  if (
    materialData.filePreview &&
    typeof materialData.filePreview === "string"
  ) {
    formData.append("previewUrl", materialData.filePreview);
  }
  // Handle preview file (for file-based materials will be uploaded separately)
  if (materialData.filePreview instanceof File) {
    // File previews are handled separately via uploadMaterialPreview
    // after material creation, so we don't append them here
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

// Recent materials are returned with lastViewedAt included in each material object
export interface RecentMaterial extends Material {
  lastViewedAt: string;
}

export async function getRecentMaterials(): Promise<
  Response<{
    items: RecentMaterial[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }>
> {
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

export async function getPopularMaterials(limit: number = 10): Promise<
  Response<{
    items: Material[];
  }>
> {
  try {
    const response = await httpClient.get("/materials/popular", {
      params: { limit },
    });
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        "Fetching popular materials failed. Please try again.",
    };
  }
}

// Search materials with pagination and filtering
export async function searchMaterials(params: MaterialSearchParams): Promise<
  Response<{
    items: Material[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasMore: boolean;
      hasPrev: boolean;
    };
  }>
> {
  // delete params.advancedSearch;
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

export async function getMaterialById(id: string): Promise<Response<Material>> {
  try {
    const response = await httpClient.get(`/materials/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error getting material by id:", error);
    throw {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        "Getting material by id failed. Please try again.",
    };
  }
}

export async function trackMaterialDownload(
  materialId: string
): Promise<Response<null>> {
  try {
    const response = await httpClient.post(`/materials/${materialId}/download`);
    return response.data;
  } catch (error: any) {
    console.error("Error tracking material download:", error);
    throw {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        "Tracking download failed. Please try again.",
    };
  }
}

// Update material (supports both file and metadata updates)
export async function updateMaterial(
  materialId: string,
  rawForm: Partial<CreateMaterialForm>
): Promise<Response<Material>> {
  const formData = new FormData();

  if (rawForm.materialTitle) {
    formData.append("label", rawForm.materialTitle);
  }
  if (rawForm.description !== undefined) {
    formData.append("description", rawForm.description);
  }
  if (rawForm.type) {
    formData.append("type", rawForm.type);
  }
  if (rawForm.accessRestrictions) {
    formData.append("restriction", rawForm.accessRestrictions);
  }
  if (rawForm.tags) {
    formData.append(
      "tags",
      Array.isArray(rawForm.tags) ? rawForm.tags.join(",") : rawForm.tags
    );
  }
  if (rawForm.targetCourseId) {
    formData.append("targetCourseId", rawForm.targetCourseId);
  }
  if (rawForm.metaData) {
    rawForm.metaData.forEach((meta: string) =>
      formData.append("metaData", meta)
    );
  }
  if (rawForm.visibility) {
    formData.append("visibility", rawForm.visibility);
  }

  // Handle file upload for file-based materials
  if ("file" in rawForm && rawForm.file) {
    formData.append("file", rawForm.file);
  }
  // Handle URL updates for link-based materials
  if ("url" in rawForm && rawForm.url) {
    formData.append("resourceAddress", rawForm.url);
  }

  try {
    const response = await httpClient.patch(
      `/materials/${materialId}`,
      formData
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating material:", error);
    throw {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        "Material update failed. Please try again.",
    };
  }
}

// Delete material
export async function deleteMaterial(
  materialId: string
): Promise<Response<Material>> {
  try {
    const response = await httpClient.delete(`/materials/${materialId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting material:", error);
    throw {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        "Material deletion failed. Please try again.",
    };
  }
}

export async function uploadMaterialPreview(
  materialId: string,
  previewFile?: File
) {
  const formData = new FormData();
  if (previewFile) {
    formData.append("preview", previewFile);
  }

  // Debug
  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    const response = await httpClient.post(
      `/materials/preview/upload/${materialId}`,
      formData
    );
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        "Material preview upload failed. Please try again.",
    };
  }
}
