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
