import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/dashboard/PageHeader";
import MaterialsSection from "@/components/dashboard/MaterialsSection";
import { UploadModal } from "@/components/modals";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/context/bookmark/BookmarkContextProvider";
import { searchMaterials, deleteMaterial } from "@/api/materials.api";
import { Material } from "@/lib/types/material.types";
import { toast } from "sonner";
import { ResponseStatus } from "@/lib/types/response.types";

const Libraries: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookmarks, isLoading: bookmarksLoading } = useBookmarks();

  const [searchQuery, setSearchQuery] = useState("");
  const [savedMaterials, setSavedMaterials] = useState<Material[]>([]);
  const [userUploads, setUserUploads] = useState<Material[]>([]);
  const [filteredSavedMaterials, setFilteredSavedMaterials] = useState<
    Material[]
  >([]);
  const [filteredUploads, setFilteredUploads] = useState<Material[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoadingUploads, setIsLoadingUploads] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Extract materials from bookmarks (materials are already included in bookmark objects)
  const fetchSavedMaterials = () => {
    if (!bookmarks.length) {
      setSavedMaterials([]);
      return;
    }

    // Extract materials from bookmarks - the material data is already included
    const materials = bookmarks
      .filter((bookmark) => bookmark.materialId && bookmark.material)
      .map((bookmark) => bookmark.material);

    setSavedMaterials(materials);
  };

  // Fetch user's uploaded materials
  const fetchUserUploads = async () => {
    if (!user?.id) {
      setUserUploads([]);
      return;
    }

    setIsLoadingUploads(true);
    setError(null);

    try {
      const response = await searchMaterials({
        creatorId: user.id,
        limit: 100, // Get all user uploads
      });

      setUserUploads(
        response.status === ResponseStatus.SUCCESS
          ? response.data.items || []
          : []
      );
    } catch (err: any) {
      setError(err.message || "Failed to fetch user uploads");
      console.error("Error fetching user uploads:", err);
    } finally {
      setIsLoadingUploads(false);
    }
  };

  // Search suggestions based on material names
  const searchSuggestions = [
    ...savedMaterials.map((material) => material.label),
    ...userUploads.map((material) => material.label),
  ].filter(Boolean); // Remove any undefined/null values

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      // If search is empty, show all materials
      setFilteredSavedMaterials(savedMaterials);
      setFilteredUploads(userUploads);
    } else {
      // Filter saved materials
      const filteredSaved = savedMaterials.filter(
        (material) =>
          material.label.toLowerCase().includes(query.toLowerCase()) ||
          material.description?.toLowerCase().includes(query.toLowerCase()) ||
          material.tags?.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          )
      );
      setFilteredSavedMaterials(filteredSaved);

      // Filter uploads
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

  const handleViewAll = (section: string) => {
    if (section === "saved materials") {
      navigate("/dashboard/saved");
    } else if (section === "my uploads") {
      navigate("/dashboard/uploads");
    }
  };

  const handleFilter = (section: string) => {
    console.log(`Filter ${section}`);
  };

  const handleShare = (materialId: string) => {
    console.log(`Share material ${materialId}`);
  };

  const handleRead = (materialId: string) => {
    navigate(`/dashboard/material/${materialId}`);
  };

  const handleSavedEmptyStateAction = () => {
    console.log("Browse materials clicked - navigating to dashboard");
    setIsNavigating(true);
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      navigate("/dashboard");
    }, 300);
  };

  const handleUploadsEmptyStateAction = () => {
    console.log("Upload material clicked - opening upload modal");
    setShowUploadModal(true);
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setShowUploadModal(true);
  };

  const handleDeleteMaterial = async (id: string) => {
    // Show confirmation toast with action button
    toast.warning("Are you sure you want to delete this material?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteMaterial(id);
            // Optimistically remove the deleted material from the list
            setUserUploads((prev) => prev.filter((m) => m.id !== id));
            toast.success("Material deleted successfully");
          } catch (error: any) {
            toast.error(
              error.message || "Failed to delete material. Please try again."
            );
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
    // Refresh uploads list
    await fetchUserUploads();
  };

  const handleModalClose = () => {
    setShowUploadModal(false);
    setEditingMaterial(null);
  };

  // Fetch data when component mounts or dependencies change
  useEffect(() => {
    if (user?.id) {
      fetchUserUploads();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!bookmarksLoading && bookmarks) {
      fetchSavedMaterials();
    }
  }, [bookmarks, bookmarksLoading]);

  // Update filtered materials when source data changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSavedMaterials(savedMaterials);
      setFilteredUploads(userUploads);
    } else {
      handleSearch(searchQuery);
    }
  }, [savedMaterials, userUploads]);

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

        {/* Libraries Content */}
        <div className="space-y-8 pb-16 md:pb-0">
          {/* Saved Materials */}
          <MaterialsSection
            title="Saved Materials"
            materials={filteredSavedMaterials}
            onViewAll={() => handleViewAll("saved materials")}
            onFilter={() => handleFilter("saved materials")}
            onShare={handleShare}
            onRead={handleRead}
            scrollStep={280}
            showViewAll={true}
            emptyStateType="saved"
            onEmptyStateAction={handleSavedEmptyStateAction}
            isLoading={bookmarksLoading}
          />

          {/* My Uploads */}
          <MaterialsSection
            title="My Uploads"
            materials={filteredUploads}
            onViewAll={() => handleViewAll("my uploads")}
            onFilter={() => handleFilter("my uploads")}
            onShare={handleShare}
            onRead={handleRead}
            scrollStep={280}
            showViewAll={true}
            emptyStateType="uploads"
            onEmptyStateAction={handleUploadsEmptyStateAction}
            isLoading={isLoadingUploads}
            onEdit={handleEditMaterial}
            onDelete={handleDeleteMaterial}
            showEditDelete={true}
          />
        </div>
      </div>

      {/* Upload Modal */}
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
