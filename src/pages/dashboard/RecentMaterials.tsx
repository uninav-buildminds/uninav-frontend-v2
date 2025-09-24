import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MaterialsLayout from "@/components/dashboard/MaterialsLayout";
import GridMaterialsSection from "@/components/dashboard/GridMaterialsSection";
import { recentMaterials, mockToMaterial } from "@/data/materials";

const RecentMaterials: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMaterials, setFilteredMaterials] = useState(
    recentMaterials.map(mockToMaterial)
  );
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Search suggestions based on material names
  const searchSuggestions = recentMaterials
    .map((material) => material.name)
    .filter(Boolean);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      // If search is empty, show all materials
      setFilteredMaterials(recentMaterials.map(mockToMaterial));
    } else {
      const filtered = recentMaterials
        .filter((material) =>
          material.name.toLowerCase().includes(query.toLowerCase())
        )
        .map(mockToMaterial);
      setFilteredMaterials(filtered);
    }
  };

  const handleFilter = () => {
    console.log("Filter recent materials");
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

  const handleEmptyStateAction = () => {
    console.log("Browse materials clicked - navigating to dashboard");
    setIsNavigating(true);
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      navigate("/dashboard");
    }, 300);
  };

  return (
    <MaterialsLayout
      title="Recent Materials"
      onSearch={handleSearch}
      onFilter={handleFilter}
      searchPlaceholder="Search recent materials..."
      searchSuggestions={searchSuggestions}
    >
      {/* Toggle Button for Testing */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowEmptyState(!showEmptyState)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          {showEmptyState ? "Show Materials" : "Show Empty State"}
        </button>
      </div>

      <GridMaterialsSection
        title=""
        materials={showEmptyState ? [] : filteredMaterials}
        onViewAll={() => {}}
        onFilter={handleFilter}
        onDownload={handleDownload}
        onShare={handleShare}
        onRead={handleRead}
        showViewAll={false}
        emptyStateType="recent"
        onEmptyStateAction={handleEmptyStateAction}
        isLoading={isNavigating}
      />
    </MaterialsLayout>
  );
};

export default RecentMaterials;
