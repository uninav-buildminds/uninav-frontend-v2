import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import PageHeader from '@/components/dashboard/PageHeader';
import MaterialsSection from '@/components/dashboard/MaterialsSection';
import { recentMaterials, recommendations } from '@/data/materials';

const Libraries: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSavedMaterials, setFilteredSavedMaterials] = useState(recentMaterials);
  const [filteredUploads, setFilteredUploads] = useState(recommendations);

  // Search suggestions based on material names
  const searchSuggestions = [
    ...recentMaterials.map(material => material.name),
    ...recommendations.map(material => material.name)
  ].filter(Boolean); // Remove any undefined/null values

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Filter saved materials
    const filteredSaved = recentMaterials.filter(material =>
      material.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSavedMaterials(filteredSaved);

    // Filter uploads
    const filteredUpload = recommendations.filter(material =>
      material.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUploads(filteredUpload);
  };

  const handleFilter = (section: string) => {
    console.log(`Filter ${section}`);
  };

  const handleDownload = (materialId: string) => {
    console.log(`Download material ${materialId}`);
  };

  const handleSave = (materialId: string) => {
    console.log(`Save material ${materialId}`);
  };

  const handleShare = (materialId: string) => {
    console.log(`Share material ${materialId}`);
  };

  const handleRead = (materialId: string) => {
    console.log(`Read material ${materialId}`);
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

        {/* Libraries Content */}
        <div className="space-y-8 pb-16 md:pb-0">
          {/* Saved Materials */}
          <MaterialsSection
            title="Saved Materials"
            materials={filteredSavedMaterials}
            onViewAll={() => {}} // No view all on this page
            onFilter={() => handleFilter("saved materials")}
            onDownload={handleDownload}
            onSave={handleSave}
            onShare={handleShare}
            onRead={handleRead}
            scrollStep={280}
            showViewAll={false}
          />

          {/* My Uploads */}
          <MaterialsSection
            title="My Uploads"
            materials={filteredUploads}
            onViewAll={() => {}} // No view all on this page
            onFilter={() => handleFilter("my uploads")}
            onDownload={handleDownload}
            onSave={handleSave}
            onShare={handleShare}
            onRead={handleRead}
            scrollStep={280}
            showViewAll={false}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Libraries;
