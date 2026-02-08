import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MaterialsLayout from "@/components/dashboard/MaterialsLayout";
import GridMaterialsSection from "@/components/dashboard/GridMaterialsSection";
import { getMaterialRecommendations } from "@/api/materials.api";
import { Material } from "@/lib/types/material.types";
import { toast } from "sonner";
import { mapRecommendationToMaterial } from "@/components/dashboard/MaterialsSection";

const Recommendations: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch recommendations on component mount
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setIsLoading(true);
        const data = await getMaterialRecommendations({
          limit: 50, // Get more recommendations for the dedicated page
          ignorePreference: false, // Use user preferences for personalized recommendations
        });

        // Handle API response
        let materials: Material[] = [];
        if (Array.isArray(data)) {
          materials = data;
        } else if (data?.data?.items) {
          materials = data.data.items.map(mapRecommendationToMaterial);
        }

        setAllMaterials(materials);
        setFilteredMaterials(materials);
      } catch (error: any) {
        console.error("Error fetching recommendations:", error);
        toast.error(error.message || "Failed to load recommendations");
        setAllMaterials([]);
        setFilteredMaterials([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, []);

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
