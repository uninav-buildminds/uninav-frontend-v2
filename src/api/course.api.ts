import { httpClient } from "./api";
import { 
  Course, 
  CreateCourseRequest, 
  LinkCourseRequest, 
  UpdateCourseRequest, 
  GetCoursesParams 
} from "@/lib/types/course.types";
import { Department } from "@/lib/types/department.types";
import { Faculty } from "@/lib/types/faculty.types";
import { Response, PaginatedResponse } from "@/lib/types/response.types";

// Export the types that are needed elsewhere
export type { Course, CreateCourseRequest, LinkCourseRequest, UpdateCourseRequest, GetCoursesParams };

// Get courses with pagination
export const getCoursesPaginated = async (params: GetCoursesParams): Promise<PaginatedResponse<Course>> => {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.query) searchParams.append("query", params.query);
  if (params.allowDepartments) searchParams.append("allowDepartments", "true");

  const response = await httpClient.get(`/course?${searchParams.toString()}`);
  return response.data;
};

// Get course by ID
export const getCourseById = async (id: string): Promise<Response<Course>> => {
  const response = await httpClient.get(`/course/${id}`);
  return response.data;
};

// Create new course
export const createCourse = async (courseData: CreateCourseRequest): Promise<Response<Course>> => {
  const response = await httpClient.post("/course", courseData);
  return response.data;
};

// Update course
export const updateCourse = async (id: string, courseData: UpdateCourseRequest): Promise<Response<Course>> => {
  const response = await httpClient.put(`/course/${id}`, courseData);
  return response.data;
};

// Delete course
export const deleteCourse = async (id: string): Promise<Response<void>> => {
  const response = await httpClient.delete(`/course/${id}`);
  return response.data;
};

// Link course to department
export const linkCourseToDepartment = async (linkData: LinkCourseRequest): Promise<Response<void>> => {
  const response = await httpClient.post("/course/link", linkData);
  return response.data;
};

// Unlink course from department
export const unlinkCourseToDepartment = async (departmentId: string, courseId: string): Promise<Response<void>> => {
  const response = await httpClient.delete(`/course/unlink/${departmentId}/${courseId}`);
  return response.data;
};

// Get all faculties with departments
export const getFaculties = async (): Promise<Response<Faculty[]>> => {
  const response = await httpClient.get("/faculty");
  return response.data;
};

// Get departments by faculty
export const getDepartmentsByFaculty = async (facultyId: string): Promise<Response<Department[]>> => {
  const response = await httpClient.get(`/department/faculty/${facultyId}`);
  return response.data;
};

// Get all courses for selection (simplified)
export const getCoursesForSelection = async (query?: string): Promise<Response<Course[]>> => {
  const searchParams = new URLSearchParams();
  if (query) searchParams.append("query", query);
  
  const response = await httpClient.get(`/course/selection?${searchParams.toString()}`);
  return response.data;
};