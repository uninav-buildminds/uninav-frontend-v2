import { httpClient } from "./api";
import {
  Course,
  CreateCourseRequest,
  LinkCourseRequest,
  UpdateCourseRequest,
  GetCoursesParams,
} from "@/lib/types/course.types";
import { Department } from "@/lib/types/department.types";
import { Faculty } from "@/lib/types/faculty.types";
import { DLC } from "@/lib/types/dlc.types";
import { Response, PaginatedResponse } from "@/lib/types/response.types";
import { DayClickEventHandler } from "react-day-picker";

interface CreateCourseDto {
  courseName: string;
  courseCode: string;
  description: string;
  departmentId: string;
  level: number;
}

interface LinkCourseDto {
  courseId: string;
  departmentId: string;
  level: number;
}

interface UpdateCourseDto {
  courseName?: string;
  courseCode?: string;
  description?: string;
}

/**
 * Get courses with optional filters
 * @param filters - Course filter options
 * @returns courses response
 */
export async function getCourses(filters?: {
  departmentId?: string;
  level?: number;
  limit?: number;
  query?: string;
  allowDepartments?: boolean;
}): Promise<Response<Course[]>> {
  try {
    const { departmentId, level, limit = 10, query } = filters || {};
    let url = `/courses?limit=${limit}`;
    if (departmentId) url += `&departmentId=${departmentId}`;
    if (level) url += `&level=${level}`;
    if (filters?.allowDepartments)
      url += `&allowDepartments=${filters.allowDepartments}`;
    if (query) url += `&query=${query}`;
    const response = await httpClient.get(url);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch courses",
    };
  }
}

/**
 * Get paginated courses
 * @param filters - Course filter options with pagination
 * @returns paginated courses response
 */
export async function getCoursesPaginated(
  filters?: GetCoursesParams & { departmentId?: string; level?: number }
): Promise<PaginatedResponse<Course>> {
  try {
    const { departmentId, level, page = 1, limit = 10, query } = filters || {};
    let url = `/courses?page=${page}&limit=${limit}`;
    if (departmentId) url += `&departmentId=${departmentId}`;
    if (level) url += `&level=${level}`;
    if (query) url += `&query=${query}`;
    if (filters?.allowDepartments)
      url += `&allowDepartments=${filters.allowDepartments}`;

    const response = await httpClient.get(url);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch courses",
    };
  }
}

/**
 * Get course by ID
 * @param id - Course ID
 * @returns course response or null
 */
export async function getCourseById(
  id: string
): Promise<Response<Course> | null> {
  try {
    const response = await httpClient.get(`/courses/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching course:", error);
    return null;
  }
}

/**
 * Get course by course code
 * @param courseCode - Course code
 * @returns course response or null
 */
export async function getCourseByCode(
  courseCode: string
): Promise<Response<Course> | null> {
  try {
    const response = await httpClient.get(`/courses/code/${courseCode}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching course by code:", error);
    return null;
  }
}

/**
 * Create a new course
 * @param courseData - Course creation data
 * @returns created course response or null
 */
export async function createCourse(
  courseData: CreateCourseDto
): Promise<Response<Course> | null> {
  try {
    const response = await httpClient.post("/courses", courseData);
    return response.data;
  } catch (error: any) {
    console.error("Error linking course to department:", error);
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to create course",
    };
  }
}

/**
 * Link course to department and level
 * @param linkData - Course linking data
 * @returns DLC response
 */
export async function linkCourseToDepartment(
  linkData: LinkCourseDto
): Promise<Response<DLC> | null> {
  try {
    const response = await httpClient.post(
      "/courses/department-level",
      linkData
    );
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message || "Failed to link course to department",
    };
  }
}

/**
 * Remove link between course and department
 * @param departmentId - Department ID
 * @param courseId - Course ID
 * @returns response
 */
export async function unlinkCourseToDepartment(
  departmentId: string,
  courseId: string
): Promise<Response<void> | null> {
  try {
    const response = await httpClient.delete(
      `/courses/department-level/${departmentId}/${courseId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error unlinking course from department:", error);
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Failed to unlink course from department",
    };
  }
}

/**
 * Get department level courses
 * @param params - Filter parameters
 * @returns paginated DLC response
 */
export async function getDepartmentLevelCourses({
  departmentId,
  courseId,
  page = 1,
  limit = 10,
}: {
  departmentId?: string;
  courseId?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<DLC> | null> {
  try {
    let url = `/courses/department-level?page=${page}&limit=${limit}`;
    if (departmentId) url += `&departmentId=${departmentId}`;
    if (courseId) url += `&courseId=${courseId}`;

    const response = await httpClient.get(url);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching department level courses:", error);
    return null;
  }
}

/**
 * Update a course
 * @param courseId - Course ID
 * @param updateData - Course update data
 * @returns updated course response
 */
export async function updateCourse(
  courseId: string,
  updateData: UpdateCourseDto
): Promise<Response<Course>> {
  try {
    const response = await httpClient.patch(`/courses/${courseId}`, updateData);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to update course",
    };
  }
}

/**
 * Delete a course
 * @param courseId - Course ID
 * @returns deletion response
 */
export async function deleteCourse(courseId: string): Promise<Response<void>> {
  try {
    const response = await httpClient.delete(`/courses/${courseId}`);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to delete course",
    };
  }
}

/**
 * Get all faculties with their departments
 * @returns faculties response
 */
export async function getFaculties(): Promise<Response<Faculty[]>> {
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
 * Get all courses for selection (simplified)
 * @param query - Optional search query
 * @returns courses response
 */
export async function getCoursesForSelection(
  query?: string
): Promise<Response<Course[]>> {
  try {
    const searchParams = new URLSearchParams();
    if (query) searchParams.append("query", query);

    const response = await httpClient.get(
      `/courses/selection?${searchParams.toString()}`
    );
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || "Failed to fetch courses",
    };
  }
}
