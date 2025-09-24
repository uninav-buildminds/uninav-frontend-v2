import { Material } from "./material.types";

export interface Bookmark {
  id: string;
  materialId?: string;
  collectionId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;

  material: Material; //always present when you fetch all bookmarks
}
