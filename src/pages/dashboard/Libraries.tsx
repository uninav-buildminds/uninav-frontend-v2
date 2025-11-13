import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderAddIcon, PreferenceHorizontalIcon } from "hugeicons-react";
import PageHeader from "@/components/dashboard/PageHeader";
import FolderCard from "@/components/dashboard/FolderCard";
import FolderModal from "@/components/modals/FolderModal";
import CreateFolderModal from "@/components/modals/CreateFolderModal";
import { DeleteFolderModal } from "@/components/modals/DeleteFolderModal";
import MaterialCard from "@/components/dashboard/MaterialCard";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/context/bookmark/BookmarkContextProvider";
import { searchMaterials, deleteMaterial } from "@/api/materials.api";
import { getMyCollections, addMaterialToCollection, updateCollection, deleteCollection, removeMaterialFromCollection } from "@/api/collection.api";
import { Material } from "@/lib/types/material.types";
import { Collection } from "@/lib/types/collection.types";
import { toast } from "sonner";
import { ResponseStatus } from "@/lib/types/response.types";
import { UploadModal } from "@/components/modals";

type TabType = "all" | "saved" | "uploads";

const Libraries: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookmarks, isLoading: bookmarksLoading } = useBookmarks();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Materials
  const [savedMaterials, setSavedMaterials] = useState<Material[]>([]);
  const [userUploads, setUserUploads] = useState<Material[]>([]);
  const [filteredSavedMaterials, setFilteredSavedMaterials] = useState<Material[]>([]);
  const [filteredUploads, setFilteredUploads] = useState<Material[]>([]);
  
  // Folders
  const [folders, setFolders] = useState<Collection[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Collection | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [draggedMaterial, setDraggedMaterial] = useState<Material | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<Collection | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  
  // Uploads
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoadingUploads, setIsLoadingUploads] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Extract materials from bookmarks
  const fetchSavedMaterials = () => {
    if (!bookmarks.length) {
      setSavedMaterials([]);
      setFilteredSavedMaterials([]);
      return;
    }

    const materials = bookmarks
      .filter((bookmark) => bookmark.materialId && bookmark.material)
      .map((bookmark) => bookmark.material);

    setSavedMaterials(materials);
    setFilteredSavedMaterials(materials);
  };

  // Fetch user's uploaded materials
  const fetchUserUploads = async () => {
    if (!user?.id) {
      setUserUploads([]);
      setFilteredUploads([]);
      return;
    }

    setIsLoadingUploads(true);
    setError(null);

    try {
      const response = await searchMaterials({
        creatorId: user.id,
        limit: 100,
      });

      const uploads = response.status === ResponseStatus.SUCCESS
        ? response.data.items || []
        : [];
      
      setUserUploads(uploads);
      setFilteredUploads(uploads);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch user uploads";
      setError(errorMessage);
      console.error("Error fetching user uploads:", errorMessage);
    } finally {
      setIsLoadingUploads(false);
    }
  };

  // Load folders
  const loadFolders = async () => {
    setIsLoadingFolders(true);
    try {
      const response = await getMyCollections(1, 100);
      if (response && response.status === "success" && response.data?.data) {
        setFolders(response.data.data);
        if (selectedFolder) {
          const updatedFolder = response.data.data.find((f: Collection) => f.id === selectedFolder.id);
          if (updatedFolder) {
            setSelectedFolder(updatedFolder);
          }
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load folders";
      console.error("Error loading folders:", errorMessage);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  // Search suggestions
  const searchSuggestions = [
    ...savedMaterials.map((material) => material.label),
    ...userUploads.map((material) => material.label),
  ].filter(Boolean);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredSavedMaterials(savedMaterials);
      setFilteredUploads(userUploads);
    } else {
      const filteredSaved = savedMaterials.filter(
        (material) =>
          material.label.toLowerCase().includes(query.toLowerCase()) ||
          material.description?.toLowerCase().includes(query.toLowerCase()) ||
          material.tags?.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          )
      );
      setFilteredSavedMaterials(filteredSaved);

      const filteredUpload = userUploads.filter(
        (material) =>
          material.label.toLowerCase().includes(query.toLowerCase()) ||
          material.description?.toLowerCase().includes(query.toLowerCase()) ||
          material.tags?.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          )
      );
      setFilteredUploads(filteredUpload);
    }
  };

  // Folder handlers
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

    setRenamingFolderId(folderId);
    updateCollection(folderId, { label: newName.trim() })
      .then((response) => {
        if (response && response.status === "success" && response.data) {
          setFolders((prev) =>
            prev.map((f) => (f.id === folderId ? response.data : f))
          );
          if (selectedFolder?.id === folderId) {
            setSelectedFolder(response.data);
          }
          toast.success("Folder renamed successfully!");
        }
      })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : "Failed to rename folder";
        toast.error(errorMessage);
      })
      .finally(() => {
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete folder";
      toast.error(errorMessage);
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
      setSavedMaterials((prev) => prev.filter((m) => m.id !== draggedMaterial.id));
      setFilteredSavedMaterials((prev) => prev.filter((m) => m.id !== draggedMaterial.id));
      
      loadFolders();
      
      if (selectedFolder?.id === folder.id) {
        setShowFolderModal(false);
        setTimeout(() => {
          setShowFolderModal(true);
        }, 100);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add material to folder";
      toast.error(errorMessage);
    } finally {
      setDraggedMaterial(null);
    }
  };

  // Mobile touch handlers for drag and drop
  const [touchTarget, setTouchTarget] = useState<HTMLElement | null>(null);

  const handleTouchStartOnFolder = (e: React.TouchEvent, folder: Collection) => {
    if (!draggedMaterial) return;
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    setTouchTarget(target);
    target.style.opacity = "0.7";
    target.style.transform = "scale(1.02)";
  };

  const handleTouchEndOnFolder = async (e: React.TouchEvent, folder: Collection) => {
    if (!draggedMaterial) return;
    
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "1";
    target.style.transform = "scale(1)";
    setTouchTarget(null);

    try {
      await addMaterialToCollection(folder.id, draggedMaterial.id);
      toast.success(`Added to ${folder.label}`);
      
      setSavedMaterials((prev) => prev.filter((m) => m.id !== draggedMaterial.id));
      setFilteredSavedMaterials((prev) => prev.filter((m) => m.id !== draggedMaterial.id));
      
      loadFolders();
      
      if (selectedFolder?.id === folder.id) {
        setShowFolderModal(false);
        setTimeout(() => {
          setShowFolderModal(true);
        }, 100);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add material to folder";
      toast.error(errorMessage);
    } finally {
      setDraggedMaterial(null);
    }
  };

  const handleTouchCancelOnFolder = (e: React.TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "1";
    target.style.transform = "scale(1)";
    setTouchTarget(null);
  };

  const handleRemoveMaterialFromFolder = async (folderId: string, materialId: string) => {
    try {
      await removeMaterialFromCollection(folderId, materialId);
      toast.success("Material removed from folder");
      
      loadFolders();
      
      if (selectedFolder?.id === folderId) {
        setShowFolderModal(false);
        setTimeout(() => {
          setShowFolderModal(true);
        }, 100);
      }
      
      const material = savedMaterials.find((m) => m.id === materialId) || 
        folders.find((f) => f.id === folderId)?.content?.find((item) => item.material?.id === materialId)?.material;
      
      if (material && !savedMaterials.find((m) => m.id === materialId)) {
        setSavedMaterials((prev) => [...prev, material]);
        setFilteredSavedMaterials((prev) => [...prev, material]);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove material from folder";
      toast.error(errorMessage);
    }
  };

  const getFolderMaterialCount = (folder: Collection): number => {
    return folder.content?.filter((item) => item.material).length || 0;
  };

  // Material handlers
  const handleRead = (materialId: string) => {
    navigate(`/dashboard/material/${materialId}`);
  };

  const handleShare = (materialId: string) => {
    const materialUrl = `${window.location.origin}/dashboard/material/${materialId}`;
    navigator.clipboard.writeText(materialUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setShowUploadModal(true);
  };

  const handleDeleteMaterial = async (id: string) => {
    toast.warning("Are you sure you want to delete this material?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteMaterial(id);
            setUserUploads((prev) => prev.filter((m) => m.id !== id));
            setFilteredUploads((prev) => prev.filter((m) => m.id !== id));
            toast.success("Material deleted successfully");
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to delete material. Please try again.";
            toast.error(errorMessage);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => toast.dismiss(),
      },
    });
  };

  const handleEditComplete = async () => {
    toast.success("Material updated successfully");
    setEditingMaterial(null);
    await fetchUserUploads();
  };

  const handleModalClose = () => {
    setShowUploadModal(false);
    setEditingMaterial(null);
  };

  // Get current materials based on active tab
  const getCurrentMaterials = (): Material[] => {
    switch (activeTab) {
      case "saved":
        return filteredSavedMaterials;
      case "uploads":
        return filteredUploads;
      case "all":
      default:
        return [...filteredSavedMaterials, ...filteredUploads];
    }
  };

  const currentMaterials = getCurrentMaterials();
  const hasContent = folders.length > 0 || currentMaterials.length > 0;
  const showFolders = activeTab === "all" || activeTab === "saved" || activeTab === "uploads";

  // Effects
  useEffect(() => {
    if (user?.id) {
      fetchUserUploads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!bookmarksLoading && bookmarks) {
      fetchSavedMaterials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarks, bookmarksLoading]);

  useEffect(() => {
    loadFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSavedMaterials(savedMaterials);
      setFilteredUploads(userUploads);
    } else {
      handleSearch(searchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedMaterials, userUploads, searchQuery]);

  return (
    <>
      <PageHeader
        title="My Libraries"
        subtitle="Manage your saved materials and uploads in one place"
        searchPlaceholder="Search your libraries..."
        searchSuggestions={searchSuggestions}
        onSearch={handleSearch}
      />
      <div className="p-4 sm:p-6">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => {
                setError(null);
                if (user?.id) {
                  fetchUserUploads();
                  fetchSavedMaterials();
                }
              }}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tabs and Actions Header */}
        <div className="flex items-center justify-between mb-6">
          {/* Tabs - Top Left */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:outline-none ${
                activeTab === "all"
                  ? "bg-brand text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:outline-none ${
                activeTab === "saved"
                  ? "bg-brand text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Saved
            </button>
            <button
              onClick={() => setActiveTab("uploads")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:outline-none ${
                activeTab === "uploads"
                  ? "bg-brand text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Uploads
            </button>
          </div>

          {/* Actions - Top Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {}}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Filter"
            >
              <PreferenceHorizontalIcon size={18} className="text-gray-600" />
            </button>
            {showFolders && (
              <button
                onClick={handleCreateFolder}
                className="p-3 rounded-full bg-brand text-white hover:bg-brand/90 transition-colors shadow-lg hover:shadow-xl"
                aria-label="Create folder"
              >
                <FolderAddIcon size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="mb-10">
          <nav className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setActiveTab("all")}
              className="text-gray-600 hover:text-brand transition-colors"
            >
              Libraries
            </button>
            {activeTab !== "all" && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-brand font-medium capitalize">{activeTab}</span>
              </>
            )}
          </nav>
        </div>

        {/* Content - Combined Grid Layout (Folders + Materials) */}
        {hasContent && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {/* Folders */}
            {showFolders && folders.map((folder) => (
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
                onTouchStart={(e) => handleTouchStartOnFolder(e, folder)}
                onTouchEnd={(e) => handleTouchEndOnFolder(e, folder)}
                onTouchCancel={handleTouchCancelOnFolder}
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
          {currentMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onShare={handleShare}
              onRead={handleRead}
              draggable={activeTab === "saved" || activeTab === "all"}
              onDragStart={handleDragStart}
              onEdit={activeTab === "uploads" ? handleEditMaterial : undefined}
              onDelete={activeTab === "uploads" ? handleDeleteMaterial : undefined}
              showEditDelete={activeTab === "uploads"}
            />
          ))}
        </div>
      )}

        {/* Empty State */}
        {!hasContent && !bookmarksLoading && !isLoadingUploads && !isLoadingFolders && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {activeTab === "all" && "No materials or folders yet"}
              {activeTab === "saved" && "No saved materials or folders yet"}
              {activeTab === "uploads" && "No uploads yet"}
            </p>
            {showFolders && (
              <button
                onClick={handleCreateFolder}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90"
              >
                <FolderAddIcon size={18} />
                Create Your First Folder
              </button>
            )}
          </div>
        )}
      </div>

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

      <UploadModal
        isOpen={showUploadModal}
        onClose={handleModalClose}
        editingMaterial={editingMaterial}
        onEditComplete={handleEditComplete}
      />
    </>
  );
};

export default Libraries;
