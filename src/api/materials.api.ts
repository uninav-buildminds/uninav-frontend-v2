import {
  PaginatedResponse,
  Response,
  ResponseSuccess,
} from "@/lib/types/response.types";
import { httpClient } from "./api";
import {
  Material,
  MaterialTypeEnum,
  VisibilityEnum,
  RestrictionEnum,
} from "@/lib/types/material.types";
import { ApprovalStatusEnum as ApprovalStatus } from "@/lib/types/response.types";
import { SearchResult } from "@/lib/types/search.types";

// Re-export enums (as values, not just types) for convenience
export {
  MaterialTypeEnum,
  VisibilityEnum,
  RestrictionEnum,
} from "@/lib/types/material.types";
export { ApprovalStatusEnum as ApprovalStatus } from "@/lib/types/response.types";

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
  folderId?: string; // Optional folder ID to add material to
  metaData?: string[];
  pageCount?: number; // Page count for PDF/DOCX/PPT files
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
  folderId?: string; // Optional folder ID to add material to
  metaData?: string[];
  fileCount?: number; // File count for Google Drive folders
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

// Search parameters for material queries
interface MaterialSearchParams {
  page?: number;
  limit?: number;
  query?: string;
  creatorId?: string;
  courseId?: string;
  type?: MaterialTypeEnum;
  tag?: string;
  reviewStatus?: ApprovalStatus;
  advancedSearch?: boolean; // Force advanced search (for specific use cases)
  ignorePreference?: boolean; // if to ignore the user's preference (should be used if the user is not logged in or admin is searching on management page)
  excludeIds?: string[]; // Material IDs to exclude from search results (for seamless advanced search)
  saveHistory?: boolean; // Whether to save this search to history (false for autocomplete, true for explicit user searches)
  sortBy?: "createdAt" | "label" | "downloads"; // Field to sort results by
  sortOrder?: "asc" | "desc"; // Sort direction
}

// Create a single material (file or link)
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
  if (materialData.folderId) {
    formData.append("folderId", materialData.folderId);
  }

  // Build metaData array with pageCount or fileCount
  const metaDataArray: string[] = [];

  if (
    "pageCount" in materialData &&
    materialData.pageCount !== undefined &&
    materialData.pageCount > 0
  ) {
    metaDataArray.push(JSON.stringify({ pageCount: materialData.pageCount }));
  }

  if (
    "fileCount" in materialData &&
    materialData.fileCount !== undefined &&
    materialData.fileCount > 0
  ) {
    metaDataArray.push(JSON.stringify({ fileCount: materialData.fileCount }));
  }

  // Add any existing metaData
  if (materialData.metaData) {
    materialData.metaData.forEach((meta: string) => metaDataArray.push(meta));
  }

  // Append metaData to form
  if (metaDataArray.length > 0) {
    metaDataArray.forEach((meta: string) => formData.append("metaData", meta));
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

// Fetch recommended materials for the current user
export async function getMaterialRecommendations(
  params: MaterialRecommendation
): Promise<
  ResponseSuccess<{
    items: Material[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }>
> {
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

// Fetch recently viewed materials for the current user
export async function getRecentMaterials(): Promise<
  ResponseSuccess<{
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

// Fetch popular materials by engagement
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

import { searchFolders } from "./folder.api";
import { Folder } from "./folder.api";

// Search materials with pagination and filtering
export async function searchMaterials(
  params: MaterialSearchParams
): Promise<ResponseSuccess<SearchResult<Material>>> {
  try {
    // Clean up params - remove undefined, null, and empty values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => {
        // Remove undefined, null, empty strings, and empty arrays
        if (value === undefined || value === null || value === "") {
          return false;
        }
        if (Array.isArray(value) && value.length === 0) {
          return false;
        }
        return true;
      })
    );

    const response = await httpClient.get("/materials", {
      params: cleanParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error searching materials:", error);
    throw {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        "Searching materials failed. Please try again.",
    };
  }
}

// Fetch guide-type materials only
export async function getGuides(
  params: Omit<MaterialSearchParams, "type"> = {}
): Promise<ResponseSuccess<SearchResult<Material>>> {
  return searchMaterials({
    ...params,
    type: MaterialTypeEnum.GUIDE,
  });
}

// Combined search for both materials and folders
export async function searchMaterialsAndFolders(
  params: MaterialSearchParams & { includeFolders?: boolean }
): Promise<ResponseSuccess<SearchResult<Material | Folder>>> {
  try {
    const {
      query,
      page = 1,
      limit = 10,
      includeFolders = true,
      ...otherParams
    } = params;

    if (!query || query.trim().length < 3) {
      return {
        status: "success" as const,
        message: "Search query too short",
        data: {
          items: [],
          pagination: {
            total: 0,
            page: 1,
            pageSize: limit,
            totalPages: 0,
            hasMore: false,
            hasPrev: false,
          },
        },
      };
    }

    // First fetch materials, then (optionally) fetch folders sequentially
    const materialsResponse = await searchMaterials({
      query,
      page,
      limit,
      ...otherParams,
    });

    let foldersResponse: ResponseSuccess<SearchResult<Folder>> | null = null;

    // Only search folders when needed and query is long enough
    if (includeFolders && query.trim().length >= 3) {
      foldersResponse = await searchFolders({
        query: query.trim(),
        page,
        limit: Math.min(limit, 5), // Limit folders to max 5 per page
      });
    }

    const materials = materialsResponse.data?.items || [];
    const folders = foldersResponse?.data?.items || [];

    // Merge results: materials first, then folders
    const mergedItems: (Material | Folder)[] = [
      ...materials,
      ...folders.map((folder) => ({ ...folder, _type: "folder" as const })),
    ];

    // Calculate combined pagination
    const materialsPagination = materialsResponse.data?.pagination;
    const foldersPagination = foldersResponse?.data?.pagination;

    const combinedPagination = {
      total:
        (materialsPagination?.total || 0) + (foldersPagination?.total || 0),
      page,
      pageSize: limit,
      totalPages: Math.max(
        materialsPagination?.totalPages || 0,
        foldersPagination?.totalPages || 0
      ),
      hasMore:
        materialsPagination?.hasMore ||
        false ||
        foldersPagination?.hasMore ||
        false,
      hasPrev: page > 1,
      // Additional metadata for folder handling
      _materialsHasMore: materialsPagination?.hasMore || false,
      _foldersHasMore: foldersPagination?.hasMore || false,
    };

    const result: SearchResult<Material | Folder> = {
      items: mergedItems,
      pagination: combinedPagination,
      // Preserve search metadata from materials search
      usedAdvanced: (materialsResponse.data as any)?.usedAdvanced,
      isAdvancedSearch: (materialsResponse.data as any)?.isAdvancedSearch,
    };

    return {
      status: "success" as const,
      message: "Combined search completed successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error in combined search:", error);
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Combined search failed. Please try again.",
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

// Get material by slug
export async function getMaterialBySlug(
  slug: string
): Promise<Response<Material>> {
  try {
    const response = await httpClient.get(`/materials/${slug}`);
    return response.data;
  } catch (error: any) {
    console.error("Error getting material:", error);
    throw {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        "Getting material failed. Please try again.",
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

export async function getGDriveThumbnail(fileId: string) {
  try {
    const response = await httpClient.get(`/gdrive/thumbnail/${fileId}`);
    return response.data.data.url;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        "Getting GDrive thumbnail failed. Please try again.",
    };
  }
}

export const cleanupTempPreview = async (
  previewUrl: string
): Promise<Response<{ deleted: boolean }>> => {
  try {
    const response = await httpClient.delete(
      "/materials/preview/cleanup/temp",
      {
        data: { previewUrl },
      }
    );

    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to cleanup temp preview",
    };
  }
};

export async function getDownloadUrl(materialId: string) {
  try {
    const response = await httpClient.get(`/materials/download/${materialId}`);
    return response.data.data.url;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        "Getting download URL failed. Please try again.",
    };
  }
}

// ============= READING PROGRESS API =============

export interface ReadingProgressData {
  currentPage?: number;
  totalPages?: number;
  currentFilePath?: string;
  currentFileId?: string;
  scrollPosition?: number;
  progressPercentage?: number;
  totalReadingTime?: number;
  isCompleted?: boolean;
}

export interface ReadingProgress extends ReadingProgressData {
  id: string;
  userId: string;
  materialId: string;
  completedAt?: string;
  lastProgressUpdate: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialWithProgress extends Material {
  readingProgress?: ReadingProgress;
}

export async function saveReadingProgress(
  materialId: string,
  progressData: ReadingProgressData
): Promise<Response<ReadingProgress>> {
  try {
    const response = await httpClient.post(
      `/materials/${materialId}/progress`,
      progressData
    );
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to save reading progress",
    };
  }
}

export async function getReadingProgress(
  materialId: string
): Promise<Response<ReadingProgress | null>> {
  try {
    const response = await httpClient.get(`/materials/${materialId}/progress`);
    return response.data;
  } catch (error: any) {
    // Return null if not found (404) instead of throwing
    if (error.response?.status === 404) {
      return {
        statusCode: 200,
        message: "No progress found",
        data: null,
      };
    }
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to get reading progress",
    };
  }
}

export async function deleteReadingProgress(
  materialId: string
): Promise<Response<ReadingProgress>> {
  try {
    const response = await httpClient.delete(
      `/materials/${materialId}/progress`
    );
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to reset reading progress",
    };
  }
}

export async function getContinueReadingMaterials(
  limit: number = 10,
  offset: number = 0
): Promise<Response<MaterialWithProgress[]>> {
  try {
    const response = await httpClient.get("/materials/continue/reading", {
      params: { limit, offset },
    });
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Failed to get continue reading materials",
    };
  }
}

export async function getReadingStats(): Promise<
  Response<{
    totalMaterialsInProgress: number;
    totalCompletedMaterials: number;
    totalReadingTime: number;
    averageProgress: number;
  }>
> {
  try {
    const response = await httpClient.get("/materials/stats/reading");
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to get reading stats",
    };
  }
}

// ============= BATCH UPLOAD API =============

/**
 * Single item in a batch upload request (for links only)
 */
export interface BatchMaterialItem {
  label: string;
  description?: string;
  type: MaterialTypeEnum;
  resourceAddress: string;
  previewUrl?: string;
  tags?: string[];
  visibility?: VisibilityEnum;
  restriction?: RestrictionEnum;
  targetCourseId?: string;
  folderId?: string;
  metaData?: Record<string, any>;
}

/**
 * Result for individual material in batch creation
 */
export interface BatchMaterialResult {
  index: number;
  success: boolean;
  materialId?: string;
  label: string;
  error?: string;
}

/**
 * Response for batch material creation
 */
export interface BatchCreateMaterialsResponse {
  totalRequested: number;
  totalSucceeded: number;
  totalFailed: number;
  results: BatchMaterialResult[];
}

/**
 * Batch create materials (for links only)
 * Files must be uploaded sequentially through the regular createMaterials function
 */
export async function batchCreateMaterials(
  materials: BatchMaterialItem[]
): Promise<Response<BatchCreateMaterialsResponse>> {
  try {
    const response = await httpClient.post("/materials/batch", { materials });
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Batch upload failed. Please try again.",
    };
  }
}

/**
 * Helper to process batch file uploads sequentially
 * Returns results similar to batch link uploads for consistency
 */
export async function batchCreateFilesMaterials(
  files: Array<{
    file: File;
    materialTitle: string;
    description?: string;
    type?: MaterialTypeEnum;
    tags?: string[];
    visibility: VisibilityEnum;
    accessRestrictions: RestrictionEnum;
    targetCourseId?: string;
    folderId?: string;
    pageCount?: number;
    filePreview?: File;
  }>,
  onProgress?: (
    current: number,
    total: number,
    result: BatchMaterialResult
  ) => void
): Promise<BatchCreateMaterialsResponse> {
  const results: BatchMaterialResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const item = files[i];
    try {
      const formData: CreateMaterialFileForm = {
        materialTitle: item.materialTitle,
        description: item.description || "",
        type: item.type,
        visibility: item.visibility,
        accessRestrictions: item.accessRestrictions,
        tags: item.tags || [],
        targetCourseId: item.targetCourseId,
        folderId: item.folderId,
        pageCount: item.pageCount,
        file: item.file,
        filePreview: item.filePreview,
      };

      const response = await createMaterials(formData);

      // Upload preview if available
      if (item.filePreview && response?.data?.id) {
        try {
          await uploadMaterialPreview(response.data.id, item.filePreview);
        } catch (previewError) {
          console.warn(
            "Preview upload failed for batch item:",
            i,
            previewError
          );
          // Continue - main material was created successfully
        }
      }

      const result: BatchMaterialResult = {
        index: i,
        success: true,
        materialId: response?.data?.id,
        label: item.materialTitle,
      };
      results.push(result);
      onProgress?.(i + 1, files.length, result);
    } catch (error: any) {
      const result: BatchMaterialResult = {
        index: i,
        success: false,
        label: item.materialTitle,
        error: error?.message || "Upload failed",
      };
      results.push(result);
      onProgress?.(i + 1, files.length, result);
    }
  }

  return {
    totalRequested: files.length,
    totalSucceeded: results.filter((r) => r.success).length,
    totalFailed: results.filter((r) => !r.success).length,
    results,
  };
}
