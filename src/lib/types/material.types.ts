import { ApprovalStatusEnum } from "./response.types";
import { UserProfile } from "./user.types";
import { Course } from "./course.types";

export enum MaterialTypeEnum {
  PDF = "pdf",
  VIDEO = "video",
  IMAGE = "image",
  AUDIO = "audio",
  DOCUMENT = "document",
  SPREADSHEET = "spreadsheet",
  PRESENTATION = "presentation",
  TEXT = "text",
  ARCHIVE = "archive",
  BOOK = "book",
  LINK = "link",
  OTHER = "other",
}

export enum VisibilityEnum {
  PUBLIC = "public",
  PRIVATE = "private",
  DEPARTMENT = "department",
}

export enum RestrictionEnum {
  NONE = "none",
  LEVEL = "level",
  COURSE = "course",
  DEPARTMENT = "department",
}

export interface Material {
  id: string;
  label: string;
  description?: string;
  type: MaterialTypeEnum;
  tags?: string[];
  visibility: VisibilityEnum;
  restriction: RestrictionEnum;
  targetCourseId?: string;
  resourceAddress?: string;
  metaData?: string[];
  fileKey?: string;
  likes: number;
  downloads: number;
  views: number;
  reviewStatus: ApprovalStatusEnum;
  creator: Pick<UserProfile, "id" | "firstName" | "lastName" | "username">;
  targetCourse?: Course;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialDto {
  label: string;
  description?: string;
  type: string; // MaterialTypeEnum
  tags?: string[];
  visibility?: string; // VisibilityEnum
  restriction?: string; // RestrictionEnum
  targetCourseId?: string;
  resourceAddress?: string;
  metaData?: string[];
  file?: File;
}
