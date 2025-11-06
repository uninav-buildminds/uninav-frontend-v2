import MaterialCard from "@/components/dashboard/MaterialCard";
import { useAuth } from "@/hooks/useAuth";
import { searchMaterials } from "@/api/materials.api";
import type { Material } from "@/lib/types/material.types";
import { useQuery } from "@tanstack/react-query";
import MaterialPlaceholder from "@/components/dashboard/MaterialPlaceholder";
import BatchPreviewUpdater from "@/components/dashboard/admin/BatchPreviewUpdater";
import { useContinueReading } from "@/hooks/useReadingProgress";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

const DashboardPage: React.FC = () => {
  const {
    data: materialsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["materials"],
    queryFn: () => searchMaterials({ page: 1, limit: 50 }),
  });

  const {
    data: continueReadingData,
    isLoading: isLoadingContinueReading,
  } = useContinueReading(6, 0);

  if (isLoading) {
    return <MaterialPlaceholder name="Loading materials..." />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const materials =
    materialsData?.status === "success" ? materialsData.data.items : [];

  const continueReadingMaterials =
    continueReadingData?.status === "success" ? continueReadingData.data : [];

  return (
    <div className="space-y-8">
      {/* DEV TOOL - CAN BE REMOVED LATER */}
      <BatchPreviewUpdater />

      {/* Continue Reading Section */}
      {!isLoadingContinueReading && continueReadingMaterials.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Continue Reading</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continueReadingMaterials.map((material, index) => (
              <div key={material.id || index} className="relative">
                <MaterialCard material={material} />
                {material.readingProgress && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-lg z-10">
                    {Math.round((material.readingProgress.progressPercentage || 0) * 100)}% complete
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
