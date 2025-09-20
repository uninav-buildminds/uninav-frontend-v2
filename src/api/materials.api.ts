import { httpClient } from "./api";

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
      statusCode: error.status,
      message:
        error.data?.message || "Material upload failed. Please try again.",
    };
  }
}

export async function getMaterialRecommendations(
  params: MaterialRecommendation
) {
  const response = await httpClient.get("/materials/recommendations", {
    params,
  });

  if (response.status === 200) {
    return response.data;
  }

  throw {
    statusCode: response.status,
    message:
      response.data?.message ||
      "Fetching material recommendations failed. Please try again.",
  };
}

export async function getRecentMaterials() {
  const response = await httpClient.get("/materials/recent");

  if (response.status === 200) {
    return response.data;
  }

  throw {
    statusCode: response.status,
    message:
      response.data?.message ||
      "Fetching recent materials failed. Please try again.",
  };
}
