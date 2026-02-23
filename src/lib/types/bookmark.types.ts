import { Material } from "./material.types";

export interface Bookmark {
  id: string;
  materialId?: string;
  collectionId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;

  // Material is present when bookmarks are fetched with includeMaterial=true
  material?: Material;
}
