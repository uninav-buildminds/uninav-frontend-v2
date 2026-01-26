import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { getMyFolders, getFolder, type Folder } from "@/api/folder.api";
import { useAuth } from "@/hooks/useAuth";

interface FolderContextType {
  folders: Folder[];
  materialIdsInFolders: Set<string>;
  isLoading: boolean;
  refreshFolders: () => Promise<void>;
}

const FolderContext = createContext<FolderContextType | undefined>(undefined);

export const FolderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create a Set of material IDs that are in folders
  const materialIdsInFolders = useMemo(() => {
    const ids = new Set<string>();
    folders.forEach((folder) => {
      folder.content?.forEach((item) => {
        if (item.contentMaterialId) {
          ids.add(item.contentMaterialId);
        }
        if (item.material?.id) {
          ids.add(item.material.id);
        }
      });
    });
    return ids;
  }, [folders]);

  const fetchFolders = async () => {
    if (!user) {
      setFolders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await getMyFolders();
      if (response && response.status === "success" && response.data) {
        // Fetch full folder details with content for each folder
        // getMyFolders() might not include content, so we fetch each folder individually to ensure we have content
        const foldersWithContent = await Promise.all(
          response.data.map(async (folder: Folder) => {
            try {
              // Always fetch full folder details to get content
              // This ensures we have accurate material IDs in folders
              const fullFolderResponse = await getFolder(folder.id);
              if (fullFolderResponse && fullFolderResponse.status === "success" && fullFolderResponse.data) {
                return fullFolderResponse.data;
              }
              // Fallback to original folder if fetch fails
              return folder;
            } catch (error) {
              console.error(`Error fetching folder ${folder.id} details:`, error);
              // Fallback to original folder if fetch fails
              return folder;
            }
          })
        );
        setFolders(foldersWithContent);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
      // Silently fail - don't block the UI
    } finally {
      setIsLoading(false);
    }
  };

  const refreshFolders = async () => {
    await fetchFolders();
  };

  useEffect(() => {
    fetchFolders();
  }, [user]);

  return (
    <FolderContext.Provider
      value={{
        folders,
        materialIdsInFolders,
        isLoading,
        refreshFolders,
      }}
    >
      {children}
    </FolderContext.Provider>
  );
};

export const useFolderContext = () => {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error("useFolderContext must be used within FolderProvider");
  }
  return context;
};

