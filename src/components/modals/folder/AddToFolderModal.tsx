import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Cancel01Icon } from "hugeicons-react";
import { Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { getMyFolders, addMaterialToFolder, type Folder } from "@/api/folder.api";
import { useAuth } from "@/hooks/useAuth";
import { setRedirectPath, convertPublicToAuthPath } from "@/lib/authStorage";
import { useFolderContext } from "@/context/folder/FolderContextProvider";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import { cn } from "@/lib/utils";

interface AddToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialId: string;
  materialTitle: string;
}

const AddToFolderModal: React.FC<AddToFolderModalProps> = ({
  isOpen,
  onClose,
  materialId,
  materialTitle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { refreshFolders } = useFolderContext();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingFolders, setIsFetchingFolders] = useState(false);
  const [error, setError] = useState<string>("");
  const [query, setQuery] = useState("");

  // Fetch user's folders when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchFolders();
    } else {
      // Reset state when modal closes
      setSelectedFolderId("");
      setError("");
      setQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchFolders = async () => {
    // Check if user is authenticated
    if (!user) {
      // Store current path for redirect after sign-in
      const currentPath = location.pathname + location.search;
      const authPath = convertPublicToAuthPath(currentPath);
      setRedirectPath(authPath);
      toast.info("Please sign in to add materials to folders");
      navigate("/auth/signin");
      onClose();
      return;
    }

    setIsFetchingFolders(true);
    setError("");
    try {
      const response = await getMyFolders();
      if (response && response.status === "success" && response.data) {
        setFolders(response.data);
      } else {
        setError("Failed to load folders");
      }
    } catch (err: unknown) {
      console.error("Error fetching folders:", err);
      // Check if error is due to authentication
      const error = err as { statusCode?: number; message?: string };
      if (error.statusCode === 401 || error.statusCode === 403) {
        const currentPath = location.pathname + location.search;
        const authPath = convertPublicToAuthPath(currentPath);
        setRedirectPath(authPath);
        toast.info("Please sign in to add materials to folders");
        navigate("/auth/signin");
        onClose();
        return;
      }
      setError(error.message || "Failed to load folders");
      toast.error("Failed to load your folders");
    } finally {
      setIsFetchingFolders(false);
    }
  };

  const handleAddToFolder = async () => {
    // Check if user is authenticated
    if (!user) {
      const currentPath = location.pathname + location.search;
      const authPath = convertPublicToAuthPath(currentPath);
      setRedirectPath(authPath);
      toast.info("Please sign in to add materials to folders");
      navigate("/auth/signin");
      onClose();
      return;
    }

    if (!selectedFolderId) {
      setError("Please select a folder");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await addMaterialToFolder(selectedFolderId, materialId);
      if (response && response.status === "success") {
        toast.success("Material added to folder successfully!");
        // Refresh folder context so MaterialCards update immediately
        await refreshFolders();
        onClose();
      } else {
        throw new Error("Failed to add material to folder");
      }
    } catch (err: unknown) {
      console.error("Error adding material to folder:", err);
      // Check if error is due to authentication
      const error = err as { statusCode?: number; message?: string };
      if (error.statusCode === 401 || error.statusCode === 403) {
        const currentPath = location.pathname + location.search;
        const authPath = convertPublicToAuthPath(currentPath);
        setRedirectPath(authPath);
        toast.info("Please sign in to add materials to folders");
        navigate("/auth/signin");
        onClose();
        return;
      }
      const errorMessage = error.message || "Failed to add material to folder";
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

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  const filteredFolders =
    query === ""
      ? folders
      : folders.filter((folder) =>
          folder.label.toLowerCase().includes(query.toLowerCase())
        );

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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-modal-backdrop flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
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
            className="relative w-full max-w-md max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-100 z-modal flex flex-col mx-1 sm:mx-4 md:mx-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/10 hover:bg-gray-100 transition-colors duration-200 z-10"
              disabled={isLoading}
              aria-label="Close"
            >
              <Cancel01Icon size={20} className="text-gray-500" />
            </button>

            {/* Modal content */}
            <div className="p-3 sm:p-6 pt-5 sm:pt-8 flex-1 overflow-y-auto scrollbar-hide">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
                Add to Folder
              </h2>
              <p className="text-sm text-gray-600 mb-6 truncate">
                {materialTitle}
              </p>

              <div className="space-y-6">
              {/* Folder Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder
                </label>
                <Combobox
                  value={selectedFolderId}
                  onChange={(newValue) => {
                    const selectedValue = newValue || "";
                    setSelectedFolderId(selectedValue);
                    setError("");
                  }}
                  onClose={() => setQuery("")}
                  disabled={isFetchingFolders}
                >
                  <div className="relative w-full">
                    <div className="flex items-center w-full">
                      <ComboboxInput
                        className="w-full py-2 pl-3 pr-10 text-sm leading-5 bg-background border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                        displayValue={() => {
                          if (isFetchingFolders) return "Loading folders...";
                          if (selectedFolder) return selectedFolder.label;
                          return "";
                        }}
                        onChange={(event) => setQuery(event.target.value)}
                        disabled={isFetchingFolders}
                        placeholder="Select a folder..."
                      />
                      <ComboboxButton className="right-0 absolute inset-y-0 flex items-center pr-2">
                        <ChevronsUpDown className="opacity-50 w-4 h-4 shrink-0" />
                      </ComboboxButton>
                    </div>
                    <ComboboxOptions className="z-[1070] absolute bg-background ring-opacity-5 shadow-lg mt-1 py-0 border border-gray-300 rounded-md focus:outline-none ring-1 ring-black w-full max-h-60 overflow-auto sm:text-sm text-base">
                      <div className="py-1">
                        {isFetchingFolders ? (
                          <div className="relative px-4 py-2 text-gray-700 cursor-default select-none">
                            Loading folders...
                          </div>
                        ) : filteredFolders.length === 0 && query !== "" ? (
                          <div className="relative px-4 py-2 text-gray-700 cursor-default select-none">
                            {error || "No folders found. Create a folder first."}
                          </div>
                        ) : (
                          filteredFolders.map((folder) => {
                            const itemCount = folder.content?.length || 0;
                            return (
                              <ComboboxOption
                                key={folder.id}
                                value={folder.id}
                                className={({ active, selected }) =>
                                  cn(
                                    "relative cursor-default select-none py-2 pl-4 pr-4 mx-1 rounded-md",
                                    selected
                                      ? "bg-gray-100 text-gray-900"
                                      : active
                                      ? "bg-gray-100 text-gray-900"
                                      : "text-foreground"
                                  )
                                }
                              >
                                {({ selected, active }) => (
                                  <>
                                    <div className="flex items-center justify-between w-full">
                                      <span
                                        className={cn(
                                          "block truncate",
                                          selected ? "font-semibold" : "font-medium"
                                        )}
                                      >
                                        {folder.label}
                                      </span>
                                      <div className="flex items-center gap-2 text-xs text-gray-500 ml-2">
                                        <span className="capitalize">
                                          {folder.visibility}
                                        </span>
                                        <span>•</span>
                                        <span>
                                          {itemCount} {itemCount === 1 ? "item" : "items"}
                                        </span>
                                      </div>
                                    </div>
                                    {selected && (
                                      <span
                                        className={cn(
                                          "absolute inset-y-0 left-0 flex items-center pl-3",
                                          active ? "text-gray-900" : "text-brand"
                                        )}
                                      >
                                        <Check className="w-4 h-4" aria-hidden="true" />
                                      </span>
                                    )}
                                  </>
                                )}
                              </ComboboxOption>
                            );
                          })
                        )}
                      </div>
                    </ComboboxOptions>
                  </div>
                </Combobox>
                {error && (
                  <p className="mt-1 text-xs text-red-600">{error}</p>
                )}
              </div>

                {/* Info message */}
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <p>
                    This material will be added to the selected folder. You can
                    organize your materials by adding them to different folders.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand/30 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToFolder}
                    disabled={isLoading || !selectedFolderId || isFetchingFolders}
                    className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand/30 focus:ring-offset-2"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Adding...</span>
                      </div>
                    ) : (
                      "Add to Folder"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AddToFolderModal;
