import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft01Icon, Folder03Icon } from "hugeicons-react";
import PageHeader from "@/components/dashboard/PageHeader";
import FolderCard from "@/components/dashboard/FolderCard";
import MaterialCard from "@/components/dashboard/MaterialCard";
import { getFolder, type Folder } from "@/api/folder.api";
import { Material } from "@/lib/types/material.types";
import { toast } from "sonner";
import { ResponseStatus } from "@/lib/types/response.types";

const FolderView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [nestedFolders, setNestedFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch folder data by ID
  useEffect(() => {
    const fetchFolder = async () => {
      if (!id) {
        setError("Invalid folder ID");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getFolder(id);
        if (response && response.status === "success" && response.data) {
          setFolder(response.data);

          // Extract materials and nested folders from folder content
          const folderMaterials: Material[] = [];
          const folderNestedFolders: Folder[] = [];

          response.data.content?.forEach((item) => {
            if (item.material) {
              folderMaterials.push(item.material as Material);
            }
            if (item.nestedFolder) {
              folderNestedFolders.push(item.nestedFolder as Folder);
            }
          });

          setMaterials(folderMaterials);
          setNestedFolders(folderNestedFolders);
        } else {
          setError("Folder not found");
          toast.error("Failed to load folder");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load folder";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Error fetching folder:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolder();
  }, [id]);

  // Handlers
  const handleBack = () => {
    navigate("/dashboard/libraries");
  };

  const handleFolderClick = (folderId: string) => {
    navigate(`/dashboard/folder/${folderId}`);
  };

  const handleMaterialRead = (slug: string) => {
    navigate(`/dashboard/material/${slug}`);
  };

  const getFolderMaterialCount = (folder: Folder): number => {
    return folder.content?.filter((item) => item.contentMaterialId).length || 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (error || !folder) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-4 p-3 bg-gray-50 rounded-full inline-block">
            <Folder03Icon className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Folder not found"}
          </h2>
          <p className="text-gray-600 mb-4">
            {error
              ? "We couldn't load this folder. Please try again."
              : "The folder you're looking for doesn't exist or has been deleted."}
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
          >
            <ArrowLeft01Icon size={18} />
            Back to Libraries
          </button>
        </div>
      </div>
    );
  }

  const hasContent = materials.length > 0 || nestedFolders.length > 0;

  return (
    <div className="min-h-screen">
      {/* Header with back button */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-brand transition-colors mb-4"
        >
          <ArrowLeft01Icon size={20} />
          <span className="text-sm font-medium">Back to Libraries</span>
        </button>

        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
            {folder.label}
          </h1>
          {folder.description && (
            <p className="text-sm text-gray-600 mb-3">{folder.description}</p>
          )}
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-brand transition-colors"
            >
              Libraries
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{folder.label}</span>
          </nav>
        </div>

        {/* Folder Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            {materials.length}{" "}
            {materials.length === 1 ? "material" : "materials"}
          </span>
          {nestedFolders.length > 0 && (
            <span>
              {nestedFolders.length}{" "}
              {nestedFolders.length === 1 ? "folder" : "folders"}
            </span>
          )}
          {folder.views > 0 && <span>{folder.views} views</span>}
          {folder.likes > 0 && <span>{folder.likes} likes</span>}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {hasContent ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {/* Nested Folders */}
            {nestedFolders.map((nestedFolder) => (
              <FolderCard
                key={nestedFolder.id}
                folder={nestedFolder}
                onClick={() => handleFolderClick(nestedFolder.id)}
                materialCount={getFolderMaterialCount(nestedFolder)}
              />
            ))}

            {/* Materials */}
            {materials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                onRead={handleMaterialRead}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-full inline-block">
              <Folder03Icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">This folder is empty</p>
            <p className="text-sm text-gray-400">
              Add materials or folders to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderView;
