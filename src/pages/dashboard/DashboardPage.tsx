import MaterialCard from "@/components/dashboard/cards/MaterialCard";
import { useAuth } from "@/hooks/useAuth";
import { searchMaterials } from "@/api/materials.api";
import type { Material } from "@/lib/types/material.types";
import { useQuery } from "@tanstack/react-query";
import MaterialPlaceholder from "@/components/dashboard/ui/MaterialPlaceholder";
import BatchPreviewUpdater from "@/components/dashboard/admin/BatchPreviewUpdater";

const DashboardPage: React.FC = () => {
  const {
    data: materialsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["materials"],
    queryFn: () => searchMaterials({ page: 1, limit: 50, saveHistory: false }), // Don't save initial page load
  });

  if (isLoading) {
    return <MaterialPlaceholder name="Loading materials..." />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const materials =
    materialsData?.status === "success" ? materialsData.data.items : [];

  return (
    <div className="space-y-8">
      {/* DEV TOOL - CAN BE REMOVED LATER */}
      <BatchPreviewUpdater />

      <div>
        <h1 className="text-3xl font-bold mb-6">Recent Materials</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material, index) => (
            <MaterialCard key={material.id || index} material={material} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
