import { ApprovalStatusEnum } from "./response.types";
import { UserProfile } from "./user.types";
import { Course } from "./course.types";

export enum ResourceTypeEnum {
  URL = "url",
  UPLOAD = "upload",
}

// Updated to match backend enum values exactly
export enum MaterialTypeEnum {
  DOCS = "docs", // doc, docx, etc.
  PDF = "pdf", // pdf files
  PPT = "ppt", // ppt, pptx
  GDRIVE = "gdrive", // Google Drive links
  YOUTUBE = "youtube", // YouTube links
  EXCEL = "excel", // excel, xls, xlsx
  IMAGE = "image", // image files
  VIDEO = "video", // video files/links
  ARTICLE = "article", // articles
  OTHER = "other", // other types
}

// Updated to match backend enum values exactly
export enum VisibilityEnum {
  PUBLIC = "public",
  PRIVATE = "private",
}

// Updated to match backend enum values exactly
export enum RestrictionEnum {
  READONLY = "readonly",
  DOWNLOADABLE = "downloadable",
}

export interface Resource {
  id: string;
  resourceAddress: string;
  resourceType: ResourceTypeEnum;
  metaData?: string[];
  fileKey?: string;
}

export interface MaterialMetadata {
  pageCount?: number; // For PDF/DOCX/PPT files
  fileCount?: number; // For Google Drive folders
  [key: string]: any; // Allow additional metadata
}

export interface Material {
  id: string;
  slug: string;
  label: string;
  description?: string;
  type: MaterialTypeEnum;
  tags?: string[];
  visibility: VisibilityEnum;
  restriction: RestrictionEnum;
  targetCourseId?: string;
  resource?: Resource;
  previewUrl?: string;
  likes: number;
  downloads: number;
  views: number;
  reviewStatus: ApprovalStatusEnum;
  metaData?: MaterialMetadata; // Structured metadata object
  creator: Pick<
    UserProfile,
    "id" | "firstName" | "lastName" | "username" | "profilePicture"
  >;
  targetCourse?: Course;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialDto {
  label: string;
  description?: string;
  type: MaterialTypeEnum;
  tags?: string[];
  visibility?: VisibilityEnum;
  restriction?: RestrictionEnum;
  targetCourseId?: string;
  resourceAddress?: string;
  metaData?: string[];
  file?: File;
}
