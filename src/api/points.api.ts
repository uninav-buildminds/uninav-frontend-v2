import { Response } from "@/lib/types/response.types";
import { httpClient } from "./api";

export interface PointsData {
  points: string; // e.g., "85%"
}

export interface DetailedPointsData {
  last30Days: number;
  allTime: number;
  percentage: string;
}

export interface AllocatePointsResponse {
  allocated: boolean;
}

/**
 * Get user's points percentage
 */
export async function getUserPoints(): Promise<Response<PointsData>> {
  try {
    const response = await httpClient.get("/user/points");
    return response.data;
  } catch (error: any) {
    console.error("Error getting user points:", error);
    throw {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        "Failed to get points. Please try again.",
    };
  }
}

/**
 * Get detailed points data
 */
export async function getDetailedPoints(): Promise<
  Response<DetailedPointsData>
> {
  try {
    const response = await httpClient.get("/user/points/detailed");
    return response.data;
  } catch (error: any) {
    console.error("Error getting detailed points:", error);
    throw {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        "Failed to get detailed points. Please try again.",
    };
  }
}

/**
 * Allocate reading points (called every 5 minutes while reading)
 */
export async function allocateReadingPoints(): Promise<
  Response<AllocatePointsResponse>
> {
  try {
    const response = await httpClient.post("/user/points/allocate");
    return response.data;
  } catch (error: any) {
    console.error("Error allocating reading points:", error);
    throw {
      statusCode: error.response?.status,
      message:
        error.response?.data?.message ||
        "Failed to allocate points. Please try again.",
    };
  }
}
