import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft01Icon,
  Folder03Icon,
  Share08Icon,
  Add01Icon,
  InformationCircleIcon,
} from "hugeicons-react";
import PageHeader from "@/components/dashboard/PageHeader";
import FolderCard from "@/components/dashboard/FolderCard";
import MaterialCard from "@/components/dashboard/MaterialCard";
import { getFolderBySlug, type Folder } from "@/api/folder.api";
import { Material } from "@/lib/types/material.types";
import { toast } from "sonner";
import { ResponseStatus } from "@/lib/types/response.types";
import { Button } from "@/components/ui/button";
import UploadModal from "@/components/modals/UploadModal";
import { useAuth } from "@/hooks/useAuth";
import { setRedirectPath, convertPublicToAuthPath } from "@/lib/authStorage";

interface FolderViewProps {
  isPublic?: boolean;
}

const FolderView: React.FC<FolderViewProps> = ({ isPublic = false }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [nestedFolders, setNestedFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Fetch folder data by slug
  useEffect(() => {
    const fetchFolder = async () => {
      if (!slug) {
        setError("Invalid folder slug");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getFolderBySlug(slug);
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
  }, [slug]);

  // Determine base path based on public/private mode
  const basePath = isPublic ? "/view" : "/dashboard";
  const backDestination = isPublic ? "/" : "/dashboard/libraries";

  // Handlers
  const handleBack = () => {
    navigate(backDestination);
  };

  const handleFolderClick = (folderSlug: string) => {
    navigate(`${basePath}/folder/${folderSlug}`);
  };

  const handleMaterialRead = (slug: string) => {
    navigate(`${basePath}/material/${slug}`);
  };

  const handleShare = () => {
    if (!folder?.slug) {
      toast.error("Cannot share folder without slug");
      return;
    }
    const shareUrl = `${window.location.origin}/view/folder/${folder.slug}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const getFolderMaterialCount = (folder: Folder): number => {
    // Prefer backend-provided stats when available, fall back to content if present
    if (typeof folder.materialCount === "number") {
      return folder.materialCount;
    }
    return folder.content?.filter((item) => item.contentMaterialId).length || 0;
  };

  const handleAddMaterial = () => {
    // Check if user is authenticated
    if (!user) {
      // Store current path for redirect after sign-in
      const currentPath = `/dashboard/folder/${slug}`;
      setRedirectPath(currentPath);
      toast.info("Please sign in to contribute to this folder");
      navigate("/auth/signin");
      return;
    }

    // Open upload modal with folder context
    setIsUploadModalOpen(true);
  };

  const handleUploadComplete = (material: Material) => {
    // Refresh folder contents after successful upload
    setMaterials((prev) => [...prev, material]);
    toast.success("Material added to folder successfully!");
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
            {isPublic ? "Back to Home" : "Back to Libraries"}
          </button>
        </div>
      </div>
    );
  }

  const hasContent = materials.length > 0 || nestedFolders.length > 0;

  return (
    <div className="min-h-screen">
      {/* Sign-in prompt banner for public views */}
      {isPublic && (
        <div className="bg-gradient-to-r from-brand/10 to-brand/5 border-b border-brand/20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center">
            <Link
              to="/auth/signin"
              onClick={() => {
                // Store current path for redirect after sign-in
                const currentPath = `/view/folder/${slug}`;
                const authPath = convertPublicToAuthPath(currentPath);
                setRedirectPath(authPath);
              }}
              className="text-sm text-gray-700 hover:text-brand transition-colors text-center"
            >
              <span className="font-medium">Viewing as guest.</span>{" "}
              <span className="text-brand hover:underline">Sign in</span> to save
              folders, track progress, and more.
            </Link>
          </div>
        </div>
      )}

      {/* Header with back button */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-brand transition-colors"
          >
            <ArrowLeft01Icon size={20} />
            <span className="text-sm font-medium">
              {isPublic ? "Back to Home" : "Back to Libraries"}
            </span>
          </button>

          {/* Share button */}
          {folder?.visibility === "public" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="inline-flex items-center gap-2"
            >
              <Share08Icon size={16} />
              <span className="hidden sm:inline">Share</span>
            </Button>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              {folder.label}
            </h1>
            {/* Add Material Button - Only show for public folders */}
            {folder.visibility === "public" && (
              <Button
                onClick={handleAddMaterial}
                size="sm"
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand/90 text-white"
              >
                <Add01Icon size={16} />
                <span className="hidden sm:inline">Add Material</span>
              </Button>
            )}
          </div>
          {folder.description && (
            <p className="text-sm text-gray-600 mb-3">{folder.description}</p>
          )}
          {/* Public folder contribution notice */}
          {folder.visibility === "public" && (
            <div className="mb-3 flex items-center gap-1.5">
              <InformationCircleIcon
                size={14}
                className="text-gray-500 flex-shrink-0"
              />
              <p className="text-xs text-gray-600">
                <span className="font-medium">Public:</span>{" "}
                <span className="hidden sm:inline">
                  Anyone can contribute materials to this folder.
                </span>
                <span className="sm:hidden">Open for contributions</span>
              </p>
            </div>
          )}
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-brand transition-colors"
            >
              {isPublic ? "Home" : "Libraries"}
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
                onClick={() => handleFolderClick(nestedFolder.slug)}
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

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        folderId={folder?.id}
        currentFolder={
          folder
            ? {
                id: folder.id,
                label: folder.label,
                description: folder.description,
              }
            : undefined
        }
        onCreateComplete={handleUploadComplete}
      />
    </div>
  );
};

export default FolderView;
