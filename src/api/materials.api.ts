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

  formData.append("description", rawForm.description);
  formData.append("file", rawForm.file); // must be File or Blob
  formData.append("label", rawForm.materialTitle);
  formData.append("restriction", rawForm.accessRestrictions.toLowerCase());
  formData.append(
    "tags",
    Array.isArray(rawForm.tags) ? rawForm.tags.join(",") : rawForm.tags
  );
  formData.append("type", "pdf"); // or detect from file
  formData.append("visibility", rawForm.visibility.toLowerCase());

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
