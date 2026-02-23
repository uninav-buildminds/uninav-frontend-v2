import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { getMyFolders, getFolderMaterialIds, type Folder } from "@/api/folder.api";
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
  const [materialIdsList, setMaterialIdsList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const materialIdsInFolders = useMemo(
    () => new Set<string>(materialIdsList),
    [materialIdsList]
  );

  const fetchFolders = async () => {
    if (!user) {
      setFolders([]);
      setMaterialIdsList([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [foldersRes, idsRes] = await Promise.all([
        getMyFolders(),
        getFolderMaterialIds(),
      ]);

      if (foldersRes && foldersRes.status === "success" && foldersRes.data) {
        const foldersData = Array.isArray(foldersRes.data) ? foldersRes.data : [];
        setFolders(foldersData);
      }

      if (idsRes && idsRes.status === "success" && idsRes.data?.materialIds) {
        setMaterialIdsList(idsRes.data.materialIds);
      } else {
        setMaterialIdsList([]);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
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

