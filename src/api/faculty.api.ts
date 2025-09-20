import { httpClient } from "./api";
import { Faculty } from "@/lib/types/faculty.types";
import { Response } from "@/lib/types/response.types";

/**
 * Get all faculties with their departments
 * @returns faculties response
 */
export async function getAllFaculties(): Promise<Response<Faculty[]>> {
  try {
    const response = await httpClient.get("/faculty");
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch faculties",
    };
  }
}

/**
 * Get faculty by ID
 * @param facultyId - Faculty ID
 * @returns faculty response or null
 */
export async function getFacultyById(
  facultyId: string
): Promise<Response<Faculty> | null> {
  try {
    const response = await httpClient.get(`/faculty/${facultyId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching faculty:", error);
    return null;
  }
}
