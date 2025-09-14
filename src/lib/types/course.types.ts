import { ApprovalStatusEnum } from "./response.types";
import { Department } from "./department.types";

export interface Course {
  id: string;
  courseName: string;
  courseCode: string;
  description?: string;
  reviewStatus: ApprovalStatusEnum;
  createdAt: string;
  updatedAt: string;
  departments?: CourseDepartment[];
}

export interface CourseDepartment {
  departmentId: string;
  level: number;
  courseId: string;
  reviewStatus: ApprovalStatusEnum;
  reviewedById: string | null;
  department: Department;
}

export interface CreateCourseRequest {
  courseName: string;
  courseCode: string;
  description?: string;
  departmentId: string;
  level: number;
}

export interface LinkCourseRequest {
  courseId: string;
  departmentId: string;
  level: number;
}

export interface UpdateCourseRequest {
  courseName?: string;
  courseCode?: string;
  description?: string;
}

export interface GetCoursesParams {
  page?: number;
  limit?: number;
  query?: string;
  allowDepartments?: boolean;
}

export enum CourseLevel {
  L100 = 100,
  L200 = 200,
  L300 = 300,
  L400 = 400,
  L500 = 500,
  L600 = 600,
}