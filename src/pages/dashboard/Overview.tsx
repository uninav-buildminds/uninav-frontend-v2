import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsSection from "@/components/dashboard/MetricsSection";
import MaterialsSection from "@/components/dashboard/MaterialsSection";
import {
  Award01Icon,
  UploadSquare01Icon,
  DownloadSquare01Icon,
  Bookmark01Icon,
} from "hugeicons-react";
import { recentMaterials, recommendations } from "@/data/materials";
import {
  getMaterialRecommendations,
  getRecentMaterials,
} from "@/api/materials.api";

const Overview: React.FC = () => {
  const navigate = useNavigate();

  const handleViewAll = (section: string) => {
    if (section === "recent materials") {
      navigate("/dashboard/recent");
    } else if (section === "recommendations") {
      navigate("/dashboard/recommendations");
    }
  };

  const handleFilter = (section: string) => {
    console.log(`Filter ${section}`);
  };

  const handleDownload = (id: string) => {
    console.log(`Download material ${id}`);
  };

  const handleSave = (id: string) => {
    console.log(`Save material ${id}`);
  };

  const handleShare = (id: string) => {
    console.log(`Share material ${id}`);
  };

  const handleRead = (id: string) => {
    console.log(`Read material ${id}`);
  };

  const fetchRecommendations = async () => {
    try {
      const data = await getMaterialRecommendations({
        limit: 10,
        ignorePreference: true,
      });
      console.log("Fetched recommendations:", data);
      return data;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  // Fetch recent materials (mocked sample)
  // ...existing code...

  const fetchRecentMaterials = async () => {
    try {
      const data = await getRecentMaterials();
      console.log("Fetched recent materials:", data);
      return data;
    } catch (error) {
      console.error("Error fetching recent materials:", error);
    }
  };

  fetchRecentMaterials();

  const metrics = [
    {
      icon: <Award01Icon size={20} />,
      title: "Your Points",
      value: "85%",
      description:
        "You're doing great! Upload 3 more materials to unlock Ad‑Free Week",
    },
    {
      icon: <DownloadSquare01Icon size={20} />,
      title: "Total Downloads",
      value: "120",
      description:
        "You have downloaded helpful materials. You're on track to complete academic goals",
    },
    {
      icon: <UploadSquare01Icon size={20} />,
      title: "Total Uploads",
      value: "50",
      description:
        "You have helped a lot of students. You're making a real difference",
    },
    {
      icon: <Bookmark01Icon size={20} />,
      title: "Saved Materials",
      value: "12",
      description:
        "Your materials were downloaded 120 times. You're making a difference!",
    },
  ];

  return (
    <DashboardLayout>
      <DashboardHeader firstName="Tee" />
      <div className="p-4 sm:p-6">
        {/* Metrics */}
        <MetricsSection metrics={metrics} />

        {/* Content Sections */}
        <div className="mt-8 space-y-8 pb-16 md:pb-0">
          {/* Recent Materials */}
          <MaterialsSection
            title="Recent Materials"
            materials={fetchRecentMaterials}
            onViewAll={() => handleViewAll("recent materials")}
            onFilter={() => handleFilter("recent materials")}
            onDownload={handleDownload}
            onSave={handleSave}
            onShare={handleShare}
            onRead={handleRead}
            scrollStep={280}
          />

          {/* Recommendations */}
          <MaterialsSection
            title="Recommendations"
            materials={fetchRecommendations}
            onViewAll={() => handleViewAll("recommendations")}
            onFilter={() => handleFilter("recommendations")}
            onDownload={handleDownload}
            onSave={handleSave}
            onShare={handleShare}
            onRead={handleRead}
            scrollStep={280}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Overview;
