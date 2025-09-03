import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import MaterialsSection from "@/components/dashboard/MaterialsSection";
import { Award01Icon, UploadSquare01Icon, DownloadSquare01Icon, Bookmark01Icon } from "hugeicons-react";
import { recentMaterials, recommendations } from "@/data/materials";

const Overview: React.FC = () => {
  const handleViewAll = (section: string) => {
    console.log(`View all ${section}`);
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

  const handleEdit = (id: string) => {
    console.log(`Edit material ${id}`);
  };

  const handleDelete = (id: string) => {
    console.log(`Delete material ${id}`);
  };

  return (
    <DashboardLayout>
      <DashboardHeader firstName="Tee" />
      <div className="p-4 sm:p-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={<Award01Icon size={20} />} title="Your Points" value="85%" description="You're doing great! Upload 3 more materials to unlock Ad‑Free Week" />
          <MetricCard icon={<DownloadSquare01Icon size={20} />} title="Total Downloads" value="120" description="You have downloaded helpful materials. You're on track to complete academic goals" />
          <MetricCard icon={<UploadSquare01Icon size={20} />} title="Total Uploads" value="50" description="You have helped a lot of students. You're making a real difference" />
          <MetricCard icon={<Bookmark01Icon size={20} />} title="Saved Materials" value="12" description="Your materials were downloaded 120 times. You're making a difference!" />
        </div>

        {/* Content Sections */}
        <div className="mt-8 space-y-8">
          {/* Recent Materials */}
          <MaterialsSection
            title="Recent Materials"
            materials={recentMaterials}
            onViewAll={() => handleViewAll("recent materials")}
            onFilter={() => handleFilter("recent materials")}
            onDownload={handleDownload}
            onSave={handleSave}
            onShare={handleShare}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Recommendations */}
          <MaterialsSection
            title="Recommendations"
            materials={recommendations}
            onViewAll={() => handleViewAll("recommendations")}
            onFilter={() => handleFilter("recommendations")}
            onDownload={handleDownload}
            onSave={handleSave}
            onShare={handleShare}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Overview;
