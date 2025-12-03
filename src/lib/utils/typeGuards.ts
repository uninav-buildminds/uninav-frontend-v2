import { Material } from "@/lib/types/material.types";
import { Folder } from "@/api/folder.api";

// Type guard to check if an item is a Material
export function isMaterial(item: Material | Folder): item is Material {
  return (
    "previewUrl" in item ||
    "reviewStatus" in item ||
    "downloads" in item ||
    "metaData" in item
  );
}

// Type guard to check if an item is a Folder
export function isFolder(item: Material | Folder): item is Folder {
  return (
    "content" in item &&
    "visibility" in item &&
    !("previewUrl" in item)
  );
}

