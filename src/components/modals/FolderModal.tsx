import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cancel01Icon, Share08Icon, Delete02Icon, Folder03Icon } from "hugeicons-react";
import { Collection } from "@/lib/types/collection.types";
import { Material } from "@/lib/types/material.types";
import { getCollection } from "@/api/collection.api";
import MaterialCard from "@/components/dashboard/MaterialCard";
import { toast } from "sonner";

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: Collection | null;
  onShare?: (folderId: string) => void;
  onDelete?: (folderId: string) => void;
  onRead?: (materialId: string) => void;
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
  const [folderData, setFolderData] = useState<Collection | null>(folder);
  const [isLoading, setIsLoading] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);

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
      const response = await getCollection(folder.id);
      if (response && response.status === "success" && response.data) {
        setFolderData(response.data);
        // Extract materials from folder content
        const folderMaterials =
          response.data.content
            ?.filter((item) => item.material)
            .map((item) => item.material as Material) || [];
        setMaterials(folderMaterials);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load folder contents";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (folder?.id) {
      if (onShare) {
        onShare(folder.id);
      } else {
        // Copy folder link to clipboard
        const folderUrl = `${window.location.origin}/dashboard/collection/${folder.id}`;
        navigator.clipboard.writeText(folderUrl);
        toast.success("Folder link copied to clipboard!");
      }
    }
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

  return createPortal(
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
            {/* Action buttons - Share, Delete, Close */}
            <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
              {onShare && (
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white/10 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                  aria-label="Share folder"
                >
                  <Share08Icon size={18} className="text-gray-600" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-full bg-white/10 hover:bg-red-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label="Delete folder"
                >
                  <Delete02Icon size={18} className="text-red-600" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Close"
              >
                <Cancel01Icon size={20} className="text-gray-500" />
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
                  <p className="text-sm text-gray-600 mb-3">{folderData.description}</p>
                )}
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center gap-2 text-sm">
                  <button
                    onClick={onClose}
                    className="text-gray-600 hover:text-brand transition-colors"
                  >
                    Libraries
                  </button>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900 font-medium">{folderData?.label || folder.label}</span>
                </nav>
              </div>

              {/* Materials Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent" />
                </div>
              ) : materials.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-full inline-block">
                    <Folder03Icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-2">This folder is empty</p>
                  <p className="text-sm text-gray-400">Drag and drop materials into the Folder to add them</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {materials.map((material) => (
                    <div key={material.id} className="relative group">
                      <MaterialCard
                        material={material}
                        onRead={onRead}
                        onShare={onShare}
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
                          <Cancel01Icon size={16} />
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
  );
};

export default FolderModal;

