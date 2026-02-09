import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MaterialsLayout from "@/components/dashboard/layout/MaterialsLayout";
import GridMaterialsSection from "@/components/dashboard/sections/GridMaterialsSection";
import { getRecentMaterials } from "@/api/materials.api";
import { Material } from "@/lib/types/material.types";
import { MaterialWithLastViewed } from "@/components/dashboard/sections/MaterialsSection";
import { toast } from "sonner";

const RecentMaterials: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [allMaterials, setAllMaterials] = useState<MaterialWithLastViewed[]>(
    []
  );
  const [filteredMaterials, setFilteredMaterials] = useState<
    MaterialWithLastViewed[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  // Fetch recent materials on component mount
  useEffect(() => {
    const loadRecentMaterials = async () => {
      try {
        setIsLoading(true);
        const response = await getRecentMaterials();

        // getRecentMaterials returns a paginated response with items already including lastViewedAt
        let materials: MaterialWithLastViewed[] = [];
        if (response.status === "success" && response.data?.items) {
          // Materials already have lastViewedAt included from backend
          materials = response.data.items;
        }

        setAllMaterials(materials);
        setFilteredMaterials(materials);
      } catch (error: any) {
        console.error("Error fetching recent materials:", error);
        toast.error(error.message || "Failed to load recent materials");
        setAllMaterials([]);
        setFilteredMaterials([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentMaterials();
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
    console.log("Filter recent materials");
  };

  const handleShare = (materialId: string) => {
    console.log(`Share material ${materialId}`);
  };

  const handleRead = (slug: string) => {
    navigate(`/dashboard/material/${slug}`);
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
      <GridMaterialsSection
        title=""
        materials={filteredMaterials}
        onViewAll={() => {}}
        onFilter={handleFilter}
        onShare={handleShare}
        onRead={handleRead}
        showViewAll={false}
        emptyStateType="recent"
        onEmptyStateAction={handleEmptyStateAction}
        isLoading={isLoading || isNavigating}
      />
    </MaterialsLayout>
  );
};

export default RecentMaterials;
