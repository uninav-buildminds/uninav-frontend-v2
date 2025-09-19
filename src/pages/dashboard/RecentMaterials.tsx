import React, { useState } from 'react';
import MaterialsLayout from '@/components/dashboard/MaterialsLayout';
import GridMaterialsSection from '@/components/dashboard/GridMaterialsSection';
import { recentMaterials } from '@/data/materials';

const RecentMaterials: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMaterials, setFilteredMaterials] = useState(recentMaterials);

  // Search suggestions based on material names
  const searchSuggestions = recentMaterials.map(material => material.name).filter(Boolean);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    const filtered = recentMaterials.filter(material =>
      material.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMaterials(filtered);
  };

  const handleFilter = () => {
    console.log('Filter recent materials');
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
        onDownload={handleDownload}
        onSave={handleSave}
        onShare={handleShare}
        onRead={handleRead}
        scrollStep={280}
        showViewAll={false}
      />
    </MaterialsLayout>
  );
};

export default RecentMaterials;
