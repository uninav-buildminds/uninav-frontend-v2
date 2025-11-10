import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cancel01Icon } from "hugeicons-react";
import { createCollection } from "@/api/collection.api";
import { Collection, CreateCollectionDto } from "@/lib/types/collection.types";
import { toast } from "sonner";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFolderCreated: (folder: Collection) => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onFolderCreated,
}) => {
  const [folderName, setFolderName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    setIsCreating(true);
    try {
      const folderData: CreateCollectionDto = {
        label: folderName.trim(),
        description: description.trim() || undefined,
        visibility: "private", // Default to private for saved materials folders
      };

      const response = await createCollection(folderData);
      if (response && response.status === "success" && response.data) {
        toast.success("Folder created successfully!");
        onFolderCreated(response.data);
        handleClose();
      } else {
        throw new Error("Failed to create folder");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create folder";
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setFolderName("");
    setDescription("");
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
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
            className="relative w-full max-w-md max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-100 z-modal flex flex-col mx-1 sm:mx-4 md:mx-0"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/10 hover:bg-gray-100 transition-colors duration-200 z-10"
              disabled={isCreating}
              aria-label="Close"
            >
              <Cancel01Icon size={20} className="text-gray-500" />
            </button>

            {/* Modal content */}
            <div className="p-3 sm:p-6 pt-5 sm:pt-8 flex-1 overflow-y-auto scrollbar-hide">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
                Create New Folder
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="folderName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Folder Name *
                  </label>
                  <input
                    id="folderName"
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="Enter folder name"
                    disabled={isCreating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    autoFocus
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description for this folder"
                    disabled={isCreating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors resize-none outline-none text-sm sm:text-base disabled:bg-gray-50 disabled:cursor-not-allowed"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isCreating}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand/30 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !folderName.trim()}
                    className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand/30 focus:ring-offset-2"
                  >
                    {isCreating ? "Creating..." : "Create Folder"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CreateFolderModal;

