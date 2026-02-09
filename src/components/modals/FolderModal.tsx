import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Cancel01Icon, Delete02Icon, Folder03Icon, InformationCircleIcon, Share08Icon } from "@hugeicons/core-free-icons";
import { Folder, getFolder } from "@/api/folder.api";
import { Material } from "@/lib/types/material.types";
import MaterialCard from "@/components/dashboard/cards/MaterialCard";
import FolderCard from "@/components/dashboard/cards/FolderCard";
import { toast } from "sonner";
import UploadModal from "./UploadModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { setRedirectPath } from "@/lib/authStorage";

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: Folder | null;
  onShare?: (folderId: string) => void;
  onDelete?: (folderId: string) => void;
  onRead?: (slug: string) => void;
  onRemoveMaterial?: (folderId: string, materialId: string) => void;
}

const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  onClose,
  folder,
  onShare,
  onDelete,
  onRead,
  onRemoveMaterial,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [folderData, setFolderData] = useState<Folder | null>(folder);
  const [isLoading, setIsLoading] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [nestedFolders, setNestedFolders] = useState<Folder[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && folder?.id) {
      loadFolderContents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, folder?.id]);

  useEffect(() => {
    setFolderData(folder);
  }, [folder]);

  const loadFolderContents = async () => {
    if (!folder?.id) return;

    setIsLoading(true);
    try {
      const response = await getFolder(folder.id);
      if (response && response.status === "success" && response.data) {
        setFolderData(response.data);
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
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load folder contents";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    const slug = folderData?.slug || folder.slug;
    if (onShare) {
      onShare(slug);
      return;
    }
    const folderUrl = `${window.location.origin}/dashboard/folder/${slug}`;
    navigator.clipboard.writeText(folderUrl);
    toast.success("Folder link copied to clipboard!");
  };

  const handleDelete = () => {
    if (folder?.id && onDelete) {
      onDelete(folder.id);
      onClose();
    }
  };

  if (!folder) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddMaterial = () => {
    // Check if user is authenticated
    if (!user) {
      // Store current path for redirect after sign-in
      const currentPath = `/dashboard/folder/${
        folderData?.slug || folder?.slug
      }`;
      setRedirectPath(currentPath);
      toast.info("Please sign in to contribute to this folder");
      onClose(); // Close folder modal first
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
    // Reload folder contents to ensure sync
    loadFolderContents();
  };

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-modal-backdrop flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={handleBackdropClick}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-100 z-modal flex flex-col mx-1 sm:mx-4 md:mx-0"
              >
                {/* Action buttons - Add, Share, Delete, Close */}
                <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                  {(folderData?.visibility === "public" ||
                    folder?.visibility === "public") && (
                    <button
                      onClick={handleAddMaterial}
                      className="p-2 rounded-full bg-white/10 hover:bg-brand/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                      aria-label="Add material to folder"
                    >
                      <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} size={18} className="text-brand" />
                    </button>
                  )}
                  {onShare && (
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-full bg-white/10 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                      aria-label="Share folder"
                    >
                      <HugeiconsIcon icon={Share08Icon} strokeWidth={1.5} size={18} className="text-gray-600" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="p-2 rounded-full bg-white/10 hover:bg-red-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-label="Delete folder"
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} size={18} className="text-red-600" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/10 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    aria-label="Close"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} size={20} className="text-gray-500" />
                  </button>
                </div>

                {/* Modal content */}
                <div className="p-3 sm:p-6 pt-5 sm:pt-8 flex-1 overflow-y-auto scrollbar-hide">
                  {/* Header */}
                  <div className="mb-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                      {folderData?.label || folder.label}
                    </h2>
                    {folderData?.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {folderData.description}
                      </p>
                    )}
                    {/* Public folder contribution notice
                    {(folderData?.visibility === "public" || folder?.visibility === "public") && (
                      <div className="mb-3 flex items-center gap-1.5">
                        <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={1.5} size={14} className="text-gray-500 flex-shrink-0" />
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Public:</span>{" "}
                          <span className="hidden sm:inline">
                            Anyone can contribute materials to this folder.
                          </span>
                          <span className="sm:hidden">Open for contributions</span>
                        </p>
                      </div>
                    )} */}
                    {/* Breadcrumb Navigation */}
                    <nav className="flex items-center gap-2 text-sm">
                      <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-brand transition-colors"
                      >
                        Libraries
                      </button>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-900 font-medium">
                        {folderData?.label || folder.label}
                      </span>
                    </nav>
                  </div>

                  {/* Materials Grid */}
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent" />
                    </div>
                  ) : materials.length === 0 && nestedFolders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-full inline-block">
                        <HugeiconsIcon icon={Folder03Icon} strokeWidth={1.5} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
                      </div>
                      <p className="text-gray-500 mb-2">This folder is empty</p>
                      <p className="text-sm text-gray-400">
                        {folderData?.visibility === "public" ||
                        folder?.visibility === "public"
                          ? "Click the + button above to add materials"
                          : "Drag and drop materials into the Folder to add them"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                      {/* Nested Folders */}
                      {nestedFolders.map((nestedFolder) => (
                        <FolderCard
                          key={nestedFolder.id}
                          folder={nestedFolder}
                          onClick={() =>
                            navigate(`/dashboard/folder/${nestedFolder.slug}`)
                          }
                          materialCount={
                            typeof nestedFolder.materialCount === "number"
                              ? nestedFolder.materialCount
                              : nestedFolder.content?.filter(
                                  (item) => item.contentMaterialId
                                ).length || 0
                          }
                        />
                      ))}

                      {/* Materials */}
                      {materials.map((material) => (
                        <div key={material.id} className="relative group">
                          <MaterialCard
                            material={material}
                            onRead={onRead}
                            onShare={onShare}
                            isInFolder={true}
                          />
                          {onRemoveMaterial && folder?.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveMaterial(folder.id, material.id);
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200 shadow-sm opacity-0 group-hover:opacity-100 z-10"
                              aria-label="Remove from folder"
                            >
                              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        folderId={folderData?.id || folder?.id}
        currentFolder={
          folderData || folder
            ? {
                id: (folderData?.id || folder?.id)!,
                label: (folderData?.label || folder?.label)!,
                description: folderData?.description || folder?.description,
              }
            : undefined
        }
        onCreateComplete={handleUploadComplete}
      />
    </>
  );
};

export default FolderModal;
