import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentMaterials } from "@/api/materials.api";
import { MaterialWithLastViewed } from "./MaterialsSection";
import { HugeiconsIcon } from "@hugeicons/react";
import { File02Icon } from "@hugeicons/core-free-icons";

interface RecentItemProps {
  material: MaterialWithLastViewed;
  onClick: () => void;
}

const RecentItem: React.FC<RecentItemProps> = ({ material, onClick }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group text-left"
    >
      {/* Preview Image or Icon */}
      <div className="flex-shrink-0 w-8 h-8 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
        {material.previewUrl && !imageError ? (
          <img
            src={material.previewUrl}
            alt={material.label}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <HugeiconsIcon icon={File02Icon} strokeWidth={1.5} size={16} className="text-gray-400" />
        )}
      </div>

      {/* Material Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-900 truncate group-hover:text-brand transition-colors">
          {material.label}
        </p>
        {material.targetCourse && (
          <p className="text-[10px] text-gray-500 truncate">
            {material.targetCourse.courseCode}
          </p>
        )}
      </div>
    </button>
  );
};

interface RecentsListProps {
  limit?: number;
  onViewAll?: () => void;
}

const RecentsList: React.FC<RecentsListProps> = ({ limit = 5, onViewAll }) => {
  const navigate = useNavigate();
  const [recentMaterials, setRecentMaterials] = useState<
    MaterialWithLastViewed[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecentMaterials = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getRecentMaterials();

      if (response.status === "success" && response.data?.items) {
        setRecentMaterials(response.data.items.slice(0, limit));
      } else {
        setRecentMaterials([]);
      }
    } catch (error) {
      console.error("Error fetching recent materials for sidebar:", error);
      setRecentMaterials([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    // initial load
    loadRecentMaterials();
  }, [loadRecentMaterials]);

  useEffect(() => {
    const handleRefresh = () => {
      // Refetch recents when a material is viewed
      loadRecentMaterials();
    };

    window.addEventListener("recents:refresh", handleRefresh);
    return () => window.removeEventListener("recents:refresh", handleRefresh);
  }, [loadRecentMaterials]);

  const handleMaterialClick = (slug: string) => {
    navigate(`/dashboard/material/${slug}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 animate-pulse"
          >
            <div className="w-8 h-8 rounded bg-gray-200" />
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
              <div className="h-2 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recentMaterials.length === 0) {
    return (
      <div className="text-xs text-gray-500 text-center py-4">
        No recent materials yet. Start exploring!
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {recentMaterials.map((material) => (
        <RecentItem
          key={material.id}
          material={material}
          onClick={() => handleMaterialClick(material.slug)}
        />
      ))}
    </div>
  );
};

export default RecentsList;
