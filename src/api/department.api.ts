import { httpClient } from "./api";
import { Department } from "@/lib/types/department.types";
import { Faculty } from "@/lib/types/faculty.types";
import { Response } from "@/lib/types/response.types";

interface CreateDepartmentDto {
  name: string;
  description?: string;
  facultyId: string;
}

interface UpdateDepartmentDto {
  name?: string;
  description?: string;
  facultyId?: string;
}

/**
 * Get all faculties
 * @returns faculties response
 */
export async function getAllFaculty(): Promise<Response<Faculty[]>> {
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
 * Get all departments
 * @returns departments response
 */
export async function getDepartments(): Promise<Response<Department[]>> {
  try {
    const response = await httpClient.get("/department");
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch departments",
    };
  }
}

/**
 * Get departments by faculty
 * @param facultyId - Faculty ID
 * @returns departments response
 */
export async function getDepartmentsByFaculty(
  facultyId: string
): Promise<Response<Department[]>> {
  try {
    const response = await httpClient.get(`/department/faculty/${facultyId}`);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch departments",
    };
  }
}

/**
 * Get department by ID
 * @param departmentId - Department ID
 * @returns department response or null
 */
export async function getDepartmentById(
  departmentId: string
): Promise<Response<Department> | null> {
  try {
    const response = await httpClient.get(`/department/${departmentId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching department:", error);
    return null;
  }
}

/**
 * Create a new department
 * @param departmentData - Department creation data
 * @returns created department response or null
 */
export async function createDepartment(
  departmentData: CreateDepartmentDto
): Promise<Response<Department> | null> {
  try {
    const response = await httpClient.post("/department", departmentData);
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to create department",
    };
  }
}

/**
 * Update a department
 * @param departmentId - Department ID
 * @param updateData - Department update data
 * @returns updated department response or null
 */
export async function updateDepartment(
  departmentId: string,
  updateData: UpdateDepartmentDto
): Promise<Response<Department> | null> {
  try {
    const response = await httpClient.patch(
      `/department/${departmentId}`,
      updateData
    );
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to update department",
    };
  }
}

/**
 * Delete a department
 * @param departmentId - Department ID
 * @returns deletion response or null
 */
export async function deleteDepartment(
  departmentId: string
): Promise<Response<Department> | null> {
  try {
    const response = await httpClient.delete(`/department/${departmentId}`);
    if (response.data.status === "success") {
      return response.data;
    }
    return null;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to delete department",
    };
  }
}
