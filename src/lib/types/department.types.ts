import { Faculty } from "./faculty.types";

export interface Department {
  id: string;
  name: string;
  description?: string;
  facultyId: string;
  faculty?: Faculty;
}