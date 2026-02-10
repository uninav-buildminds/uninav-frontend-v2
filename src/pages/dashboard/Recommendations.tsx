import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MaterialsLayout from "@/components/dashboard/layout/MaterialsLayout";
import GridMaterialsSection from "@/components/dashboard/sections/GridMaterialsSection";
import { getMaterialRecommendations } from "@/api/materials.api";
import { Material } from "@/lib/types/material.types";
import { toast } from "sonner";
import { mapRecommendationToMaterial } from "@/components/dashboard/sections/GridMaterialsSection";
import { useQuery } from "@tanstack/react-query";

const Recommendations: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);

  const {
    data: allMaterials = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recommendations", "materials"],
    queryFn: async () => {
      const response = await getMaterialRecommendations({
        limit: 50, // Get more recommendations for the dedicated page
        ignorePreference: false, // Use user preferences for personalized recommendations
      });

      return response.data.items;
    },
  });

  useEffect(() => {
    if (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load recommendations";
      console.error("Error fetching recommendations:", error);
      toast.error(message);
    }
  }, [error]);

  useEffect(() => {
    // Sync filtered list with fetched data when not actively searching
    if (!searchQuery.trim()) {
      setFilteredMaterials(allMaterials);
    }
  }, [allMaterials, searchQuery]);

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
      const filtered = allMaterials.filter((material) =>
        material.label.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMaterials(filtered);
    }
  };

  const handleFilter = () => {
    console.log("Filter recommendations");
  };

  const handleShare = (materialId: string) => {
    console.log(`Share material ${materialId}`);
  };

  const handleRead = (slug: string) => {
    navigate(`/dashboard/material/${slug}`);
  };

  return (
    <MaterialsLayout
      title="Recommendations"
      onSearch={handleSearch}
      onFilter={handleFilter}
      searchPlaceholder="Search recommendations..."
      searchSuggestions={searchSuggestions}
    >
      <GridMaterialsSection
        title=""
        materials={filteredMaterials}
        onViewAll={() => {}}
        onFilter={handleFilter}
        onShare={handleShare}
        onRead={handleRead}
        showViewAll={false}
        emptyStateType="recommendations"
        isLoading={isLoading}
      />
    </MaterialsLayout>
  );
};

export default Recommendations;
