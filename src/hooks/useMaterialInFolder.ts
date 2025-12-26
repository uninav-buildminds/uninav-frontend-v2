import { useFolderContext } from "@/context/folder/FolderContextProvider";

/**
 * Hook to check if a material is in any folder
 * Uses the FolderContext to get material IDs that are in folders
 */
export const useMaterialInFolder = () => {
  const { materialIdsInFolders, isLoading } = useFolderContext();
  
  return {
    materialIdsInFolders,
    isLoading,
  };
};

