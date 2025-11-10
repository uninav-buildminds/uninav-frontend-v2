import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MaterialsLayout from "@/components/dashboard/MaterialsLayout";
import GridMaterialsSection from "@/components/dashboard/GridMaterialsSection";
import { useAuth } from "@/hooks/useAuth";
import { searchMaterials, deleteMaterial } from "@/api/materials.api";
import { Material } from "@/lib/types/material.types";
import { toast } from "sonner";
import { ResponseStatus } from "@/lib/types/response.types";
import { UploadModal } from "@/components/modals";

const MyUploads: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Fetch user's uploaded materials
  useEffect(() => {
    const fetchUserUploads = async () => {
      if (!user?.id) {
        setAllMaterials([]);
        setFilteredMaterials([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await searchMaterials({
          creatorId: user.id,
          limit: 100, // Get all user uploads
        });

        const materials =
          response.status === ResponseStatus.SUCCESS
            ? response.data.items || []
            : [];

        setAllMaterials(materials);
        setFilteredMaterials(materials);
      } catch (err: any) {
        setError(err.message || "Failed to fetch user uploads");
        console.error("Error fetching user uploads:", err);
        setAllMaterials([]);
        setFilteredMaterials([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserUploads();
  }, [user?.id]);

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
    console.log("Filter uploads");
  };

  const handleShare = (materialId: string) => {
    console.log(`Share material ${materialId}`);
  };

  const handleRead = (materialId: string) => {
    navigate(`/dashboard/material/${materialId}`);
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
            setAllMaterials((prev) => prev.filter((m) => m.id !== id));
            setFilteredMaterials((prev) => prev.filter((m) => m.id !== id));
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
    if (user?.id) {
      setIsLoading(true);
      try {
        const response = await searchMaterials({
          creatorId: user.id,
          limit: 100,
        });
        const materials =
          response.status === ResponseStatus.SUCCESS
            ? response.data.items || []
            : [];
        setAllMaterials(materials);
        setFilteredMaterials(materials);
      } catch (err: any) {
        console.error("Error refreshing uploads:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleModalClose = () => {
    setShowUploadModal(false);
    setEditingMaterial(null);
  };

  const handleEmptyStateAction = () => {
    console.log("Upload material clicked - opening upload modal");
    setShowUploadModal(true);
  };

  return (
    <>
      <MaterialsLayout
        title="My Uploads"
        onSearch={handleSearch}
        onFilter={handleFilter}
        searchPlaceholder="Search your uploads..."
        searchSuggestions={searchSuggestions}
        showBackButton={true}
        backTo="/dashboard/libraries"
      >
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => {
                setError(null);
                if (user?.id) {
                  setIsLoading(true);
                  searchMaterials({
                    creatorId: user.id,
                    limit: 100,
                  })
                    .then((response) => {
                      const materials =
                        response.status === ResponseStatus.SUCCESS
                          ? response.data.items || []
                          : [];
                      setAllMaterials(materials);
                      setFilteredMaterials(materials);
                    })
                    .catch((err: any) => {
                      setError(err.message || "Failed to fetch user uploads");
                    })
                    .finally(() => setIsLoading(false));
                }
              }}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Retry
            </button>
          </div>
        )}

        <GridMaterialsSection
          title=""
          materials={filteredMaterials}
          onViewAll={() => {}}
          onFilter={handleFilter}
          onShare={handleShare}
          onRead={handleRead}
          showViewAll={false}
          emptyStateType="uploads"
          onEmptyStateAction={handleEmptyStateAction}
          isLoading={isLoading}
          onEdit={handleEditMaterial}
          onDelete={handleDeleteMaterial}
          showEditDelete={true}
        />
      </MaterialsLayout>

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

export default MyUploads;

