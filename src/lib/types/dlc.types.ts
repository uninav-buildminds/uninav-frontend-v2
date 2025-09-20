import { ApprovalStatusEnum } from "./response.types";
import { Department } from "./department.types";
import { Course } from "./course.types";

export interface DLC {
  departmentId: string;
  courseId: string;
  level: number;
  reviewStatus: ApprovalStatusEnum;
  reviewedById?: string | null;
  department: Department;
  course: Course;
}
