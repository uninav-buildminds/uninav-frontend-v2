import { UserProfile } from "./user.types";
import { Material } from "./material.types";

export interface Collection {
  id: string;
  label: string;
  description?: string;
  visibility: "public" | "private";
  targetCourseId?: string;
  creator: Pick<UserProfile, "id" | "firstName" | "lastName" | "username">;
  content?: Array<{
    id: string;
    collectionId: string;
    materialId?: string;
    nestedCollectionId?: string;
    material?: Material;
    nestedCollection?: Collection;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionDto {
  label: string;
  description?: string;
  visibility?: "public" | "private";
  targetCourseId?: string;
}

export interface UpdateCollectionDto extends Partial<CreateCollectionDto> {}
