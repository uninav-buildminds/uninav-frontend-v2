import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Add01Icon, SortingAZ02Icon } from "hugeicons-react";
import MaterialsLayout from "@/components/dashboard/MaterialsLayout";
import FolderCard from "@/components/dashboard/FolderCard";
import FolderModal from "@/components/modals/FolderModal";
import CreateFolderModal from "@/components/modals/CreateFolderModal";
import { DeleteFolderModal } from "@/components/modals/DeleteFolderModal";
import MaterialCard from "@/components/dashboard/MaterialCard";
import { useBookmarks } from "@/context/bookmark/BookmarkContextProvider";
import { Material } from "@/lib/types/material.types";
import { Collection } from "@/lib/types/collection.types";
import { getMyCollections, addMaterialToCollection, updateCollection, deleteCollection, removeMaterialFromCollection } from "@/api/collection.api";
import { toast } from "sonner";

const SavedMaterials: React.FC = () => {
  const navigate = useNavigate();
  const { bookmarks, isLoading: bookmarksLoading } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState("");
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [folders, setFolders] = useState<Collection[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Collection | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [draggedMaterial, setDraggedMaterial] = useState<Material | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Collection | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);

  // Extract materials from bookmarks
  useEffect(() => {
    if (!bookmarks.length) {
      setAllMaterials([]);
      setFilteredMaterials([]);
      return;
    }

    // Extract materials from bookmarks - the material data is already included
    const materials = bookmarks
      .filter((bookmark) => bookmark.materialId && bookmark.material)
      .map((bookmark) => bookmark.material);

    setAllMaterials(materials);
    setFilteredMaterials(materials);
  }, [bookmarks]);

  // Load folders
  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    setIsLoadingFolders(true);
    try {
      const response = await getMyCollections(1, 100);
      if (response?.data?.data) {
        setFolders(response.data.data);
        // Update selected folder if it's open to refresh material count
        if (selectedFolder) {
          const updatedFolder = response.data.data.find((f: Collection) => f.id === selectedFolder.id);
          if (updatedFolder) {
            setSelectedFolder(updatedFolder);
          }
        }
      }
    } catch (error: any) {
      console.error("Error loading folders:", error);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  // Search suggestions based on material names
  const searchSuggestions = allMaterials
    .map((material) => material.label)
    .filter(Boolean);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      // If search is empty, show all materials
      setFilteredMaterials(allMaterials);
    } else {
      const filtered = allMaterials.filter(
        (material) =>
          material.label.toLowerCase().includes(query.toLowerCase()) ||
          material.description?.toLowerCase().includes(query.toLowerCase()) ||
          material.tags?.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          )
      );
      setFilteredMaterials(filtered);
    }
  };

  const handleFilter = () => {
    console.log("Filter saved materials");
  };

  const handleShare = (materialId: string) => {
    console.log(`Share material ${materialId}`);
  };

  const handleRead = (materialId: string) => {
    navigate(`/dashboard/material/${materialId}`);
  };

  const handleEmptyStateAction = () => {
    console.log("Browse materials clicked - navigating to dashboard");
    setIsNavigating(true);
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      navigate("/dashboard");
    }, 300);
  };

  const handleCreateFolder = () => {
    setShowCreateFolderModal(true);
  };

  const handleFolderCreated = (folder: Collection) => {
    setFolders((prev) => [folder, ...prev]);
    setShowCreateFolderModal(false);
  };

  const handleFolderClick = (folder: Collection) => {
    setSelectedFolder(folder);
    setShowFolderModal(true);
  };

  const handleShareFolder = (folderId: string) => {
    const folderUrl = `${window.location.origin}/dashboard/collection/${folderId}`;
    navigator.clipboard.writeText(folderUrl);
    toast.success("Folder link copied to clipboard!");
  };

  const handleEditFolder = (folderId: string, newName: string) => {
    if (!newName.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }

    // Set renaming state immediately
    setRenamingFolderId(folderId);
    
    updateCollection(folderId, { label: newName.trim() })
      .then((response) => {
        if (response && response.status === "success" && response.data) {
          setFolders((prev) =>
            prev.map((f) => (f.id === folderId ? response.data : f))
          );
          // Update selected folder if it's the one being edited
          if (selectedFolder?.id === folderId) {
            setSelectedFolder(response.data);
          }
          toast.success("Folder renamed successfully!");
        }
      })
      .catch((error: any) => {
        toast.error(error.message || "Failed to rename folder");
      })
      .finally(() => {
        // Clear renaming state after a small delay to ensure spinner is visible
        setTimeout(() => {
          setRenamingFolderId(null);
        }, 300);
      });
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;
    setFolderToDelete(folder);
    setShowDeleteModal(true);
  };

  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return;

    try {
      await deleteCollection(folderToDelete.id);
      setFolders((prev) => prev.filter((f) => f.id !== folderToDelete.id));
      if (selectedFolder?.id === folderToDelete.id) {
        setShowFolderModal(false);
        setSelectedFolder(null);
      }
      setShowDeleteModal(false);
      setFolderToDelete(null);
      toast.success("Folder deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete folder");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (material: Material) => {
    setDraggedMaterial(material);
  };

  const handleDragOver = (e: React.DragEvent, folder: Collection) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.opacity = "0.7";
      target.style.transform = "scale(1.02)";
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.opacity = "1";
      target.style.transform = "scale(1)";
    }
  };

  const handleDrop = async (e: React.DragEvent, folder: Collection) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.currentTarget as HTMLElement;
    if (target) {
      target.style.opacity = "1";
      target.style.transform = "scale(1)";
    }

    if (!draggedMaterial) return;

    try {
      await addMaterialToCollection(folder.id, draggedMaterial.id);
      toast.success(`Added to ${folder.label}`);
      
      // Remove material from the main materials list
      setAllMaterials((prev) => prev.filter((m) => m.id !== draggedMaterial.id));
      setFilteredMaterials((prev) => prev.filter((m) => m.id !== draggedMaterial.id));
      
      // Reload folders to update material counts
      loadFolders();
      
      // Reload folder modal if it's open
      if (selectedFolder?.id === folder.id) {
        setShowFolderModal(false);
        setTimeout(() => {
          setShowFolderModal(true);
        }, 100);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add material to folder");
    } finally {
      setDraggedMaterial(null);
    }
  };

  const getFolderMaterialCount = (folder: Collection): number => {
    return folder.content?.filter((item) => item.material).length || 0;
  };

  const handleRemoveMaterialFromFolder = async (folderId: string, materialId: string) => {
    try {
      await removeMaterialFromCollection(folderId, materialId);
      toast.success("Material removed from folder");
      
      // Reload folders to update material counts
      loadFolders();
      
      // Reload folder modal if it's open
      if (selectedFolder?.id === folderId) {
        setShowFolderModal(false);
        setTimeout(() => {
          setShowFolderModal(true);
        }, 100);
      }
      
      // Add material back to the main materials list
      const material = allMaterials.find((m) => m.id === materialId) || 
        folders.find((f) => f.id === folderId)?.content?.find((item) => item.material?.id === materialId)?.material;
      
      if (material && !allMaterials.find((m) => m.id === materialId)) {
        setAllMaterials((prev) => [...prev, material]);
        setFilteredMaterials((prev) => [...prev, material]);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to remove material from folder");
    }
  };

  const hasContent = folders.length > 0 || filteredMaterials.length > 0;

  return (
    <>
      <MaterialsLayout
        title="Saved Materials"
        onSearch={handleSearch}
        onFilter={handleFilter}
        searchPlaceholder="Search saved materials..."
        searchSuggestions={searchSuggestions}
        showBackButton={true}
        backTo="/dashboard/libraries"
      >
        <div className="space-y-6">
          {/* Header with Create Folder Button */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {folders.length > 0 || filteredMaterials.length > 0
                ? "Folders & Materials"
                : ""}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleFilter}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Filter"
              >
                <SortingAZ02Icon size={18} className="text-gray-600" />
              </button>
              <button
                onClick={handleCreateFolder}
                className="p-3 rounded-full bg-brand text-white hover:bg-brand/90 transition-colors shadow-lg hover:shadow-xl"
                aria-label="Create folder"
              >
                <Add01Icon size={20} />
              </button>
            </div>
          </div>

          {/* Combined Folders & Materials Grid */}
          {hasContent && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {/* Folders */}
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDragOver(e, folder);
                  }}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDrop(e, folder);
                  }}
                  className="transition-opacity"
                >
                  <FolderCard
                    folder={folder}
                    onClick={() => handleFolderClick(folder)}
                    onShare={() => handleShareFolder(folder.id)}
                    onEdit={handleEditFolder}
                    onDelete={handleDeleteFolder}
                    materialCount={getFolderMaterialCount(folder)}
                    isRenaming={renamingFolderId === folder.id}
                  />
                </div>
              ))}
              
              {/* Materials */}
              {filteredMaterials.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onShare={handleShare}
                  onRead={handleRead}
                  draggable={true}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!hasContent && !bookmarksLoading && !isLoadingFolders && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No saved materials or folders yet</p>
              <button
                onClick={handleCreateFolder}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90"
              >
                <Add01Icon size={18} />
                Create Your First Folder
              </button>
            </div>
          )}
        </div>
      </MaterialsLayout>

      {/* Modals */}
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onFolderCreated={handleFolderCreated}
      />

      <FolderModal
        isOpen={showFolderModal}
        onClose={() => {
          setShowFolderModal(false);
          setSelectedFolder(null);
        }}
        folder={selectedFolder}
        onShare={handleShareFolder}
        onDelete={handleDeleteFolder}
        onRead={handleRead}
        onRemoveMaterial={handleRemoveMaterialFromFolder}
      />

      <DeleteFolderModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setFolderToDelete(null);
        }}
        onConfirm={confirmDeleteFolder}
        folderName={folderToDelete?.label}
      />
    </>
  );
};

export default SavedMaterials;

