import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import MaterialsSection from "@/components/dashboard/MaterialsSection";
import { UploadModal } from "@/components/modals";
import {
  recentMaterials,
  recommendations,
  mockToMaterial,
} from "@/data/materials";

const Libraries: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSavedMaterials, setFilteredSavedMaterials] = useState(
    recentMaterials.map(mockToMaterial)
  );
  const [filteredUploads, setFilteredUploads] = useState(
    recommendations.map(mockToMaterial)
  );
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Search suggestions based on material names
  const searchSuggestions = [
    ...recentMaterials.map((material) => material.name),
    ...recommendations.map((material) => material.name),
  ].filter(Boolean); // Remove any undefined/null values

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      // If search is empty, show all materials
      setFilteredSavedMaterials(recentMaterials.map(mockToMaterial));
      setFilteredUploads(recommendations.map(mockToMaterial));
    } else {
      // Filter saved materials
      const filteredSaved = recentMaterials
        .filter((material) =>
          material.name.toLowerCase().includes(query.toLowerCase())
        )
        .map(mockToMaterial);
      setFilteredSavedMaterials(filteredSaved);

      // Filter uploads
      const filteredUpload = recommendations
        .filter((material) =>
          material.name.toLowerCase().includes(query.toLowerCase())
        )
        .map(mockToMaterial);
      setFilteredUploads(filteredUpload);
    }
  };

  const handleFilter = (section: string) => {
    console.log(`Filter ${section}`);
  };

  const handleDownload = (materialId: string) => {
    console.log(`Download material ${materialId}`);
  };

  const handleShare = (materialId: string) => {
    console.log(`Share material ${materialId}`);
  };

  const handleRead = (materialId: string) => {
    console.log(`Read material ${materialId}`);
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

  return (
    <DashboardLayout>
      <PageHeader
        title="My Libraries"
        subtitle="Manage your saved materials and uploads in one place"
        searchPlaceholder="Search your libraries..."
        searchSuggestions={searchSuggestions}
        onSearch={handleSearch}
      />
      <div className="p-4 sm:p-6">
        {/* Toggle Button for Testing */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowEmptyState(!showEmptyState)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            {showEmptyState ? "Show Materials" : "Show Empty State"}
          </button>
        </div>

        {/* Libraries Content */}
        <div className="space-y-8 pb-16 md:pb-0">
          {/* Saved Materials */}
          <MaterialsSection
            title="Saved Materials"
            materials={showEmptyState ? [] : filteredSavedMaterials}
            onViewAll={() => {}} // No view all on this page
            onFilter={() => handleFilter("saved materials")}
            onDownload={handleDownload}
            onShare={handleShare}
            onRead={handleRead}
            scrollStep={280}
            showViewAll={false}
            emptyStateType="saved"
            onEmptyStateAction={handleSavedEmptyStateAction}
            isLoading={isNavigating}
          />

          {/* My Uploads */}
          <MaterialsSection
            title="My Uploads"
            materials={showEmptyState ? [] : filteredUploads}
            onViewAll={() => {}} // No view all on this page
            onFilter={() => handleFilter("my uploads")}
            onDownload={handleDownload}
            onShare={handleShare}
            onRead={handleRead}
            scrollStep={280}
            showViewAll={false}
            emptyStateType="uploads"
            onEmptyStateAction={handleUploadsEmptyStateAction}
          />
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </DashboardLayout>
  );
};

export default Libraries;
