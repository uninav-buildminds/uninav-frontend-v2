import { Course } from "./course.types";
import { Department } from "./department.types";
import { UserRole } from "./response.types";

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  departmentId?: string;
  level: number;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  department?: Department;
  profilePicture?: string;
  auth: {
    userId: string;
    email: string;
    verificationCode: string | null;
    emailVerified: boolean;
    matricNo: string | null;
    userIdType: string | null;
    userIdImage: string | null;
    userIdVerified: boolean;
  };
  courses: {
    userId: string;
    courseId: string;
    course: Course;
  }[];
};
