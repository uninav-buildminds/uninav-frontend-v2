import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { toast } from "sonner";
import { SelectModal, SelectOption } from "./SearchSelectModal";
import { getMyFolders, addNestedFolder, type Folder } from "@/api/folder.api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { setRedirectPath, convertPublicToAuthPath } from "@/lib/authStorage";

interface AddFolderToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: string;
  folderLabel: string;
}

// Modal to add a folder into another folder (nested folder support)
const AddFolderToFolderModal: React.FC<AddFolderToFolderModalProps> = ({
  isOpen,
  onClose,
  folderId,
  folderLabel,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingFolders, setIsFetchingFolders] = useState(false);
  const [error, setError] = useState<string>("");

  // Fetch user's folders when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchFolders();
    } else {
      setSelectedParentId("");
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Fetch folders that can be used as parents (exclude the folder itself)
  const fetchFolders = async () => {
    if (!user) {
      const currentPath = location.pathname + location.search;
      const authPath = convertPublicToAuthPath(currentPath);
      setRedirectPath(authPath);
      toast.info("Please sign in to organize folders");
      navigate("/auth/signin");
      onClose();
      return;
    }

    setIsFetchingFolders(true);
    setError("");
    try {
      const response = await getMyFolders();
      if (response && response.status === "success" && response.data) {
        // Exclude the folder itself to avoid obvious self-nesting
        const available = response.data.filter((f) => f.id !== folderId);
        setFolders(available);
      } else {
        setError("Failed to load folders");
      }
    } catch (err: any) {
      console.error("Error fetching folders:", err);
      if (err.statusCode === 401 || err.statusCode === 403) {
        const currentPath = location.pathname + location.search;
        const authPath = convertPublicToAuthPath(currentPath);
        setRedirectPath(authPath);
        toast.info("Please sign in to organize folders");
        navigate("/auth/signin");
        onClose();
        return;
      }
      setError(err.message || "Failed to load folders");
      toast.error("Failed to load your folders");
    } finally {
      setIsFetchingFolders(false);
    }
  };

  const handleAddToFolder = async () => {
    if (!user) {
      const currentPath = location.pathname + location.search;
      const authPath = convertPublicToAuthPath(currentPath);
      setRedirectPath(authPath);
      toast.info("Please sign in to organize folders");
      navigate("/auth/signin");
      onClose();
      return;
    }

    if (!selectedParentId) {
      setError("Please select a folder");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await addNestedFolder(selectedParentId, folderId);
      if (response && response.status === "success") {
        toast.success("Folder added to target folder successfully!");
        onClose();
      } else {
        throw new Error("Failed to add folder to target folder");
      }
    } catch (err: any) {
      console.error("Error adding folder to folder:", err);
      if (err.statusCode === 401 || err.statusCode === 403) {
        const currentPath = location.pathname + location.search;
        const authPath = convertPublicToAuthPath(currentPath);
        setRedirectPath(authPath);
        toast.info("Please sign in to organize folders");
        navigate("/auth/signin");
        onClose();
        return;
      }
      const errorMessage =
        err.message || "Failed to add folder to target folder";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const folderOptions: SelectOption[] = folders.map((folder) => ({
    value: folder.id,
    label: folder.label,
    description: folder.description,
    metadata: {
      visibility: folder.visibility,
      itemCount: folder.content?.length || 0,
    },
  }));

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget && !isLoading) {
                  handleClose();
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-xl shadow-xl w-full max-w-md relative z-50"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Add Folder to Folder
                    </h2>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {folderLabel}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <SelectModal
                      value={selectedParentId}
                      onChange={(value) => {
                        setSelectedParentId(value);
                        setError("");
                      }}
                      options={folderOptions}
                      placeholder="Select a target folder..."
                      label="Target Folder"
                      loading={isFetchingFolders}
                      emptyMessage="No folders found. Create a folder first."
                      error={error}
                      searchable={true}
                      renderOption={(option, selected) => (
                        <div className="flex flex-col">
                          <span
                            className={`block truncate ${
                              selected ? "font-medium" : "font-normal"
                            }`}
                          >
                            {option.label}
                          </span>
                          {option.description && (
                            <span className="text-xs text-gray-500 truncate">
                              {option.description}
                            </span>
                          )}
                          {option.metadata && (
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                              <span className="capitalize">
                                {option.metadata.visibility}
                              </span>
                              <span>•</span>
                              <span>
                                {option.metadata.itemCount}{" "}
                                {option.metadata.itemCount === 1
                                  ? "item"
                                  : "items"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <p>
                      This folder will be added as a nested folder inside the
                      selected target folder. Use this to organize collections
                      into a deeper folder structure.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddToFolder}
                    disabled={
                      isLoading || !selectedParentId || isFetchingFolders
                    }
                    className="bg-brand hover:bg-brand/90 text-white"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Adding...</span>
                      </div>
                    ) : (
                      "Add to Folder"
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default AddFolderToFolderModal;
