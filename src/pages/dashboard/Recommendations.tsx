import React, { useState } from 'react';
import MaterialsLayout from '@/components/dashboard/MaterialsLayout';
import GridMaterialsSection from '@/components/dashboard/GridMaterialsSection';
import { recommendations } from '@/data/materials';

const Recommendations: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMaterials, setFilteredMaterials] = useState(recommendations);

  // Search suggestions based on material names
  const searchSuggestions = recommendations.map(material => material.name).filter(Boolean);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      // If search is empty, show all materials
      setFilteredMaterials(recommendations);
    } else {
      const filtered = recommendations.filter(material =>
        material.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMaterials(filtered);
    }
  };

  const handleFilter = () => {
    console.log('Filter recommendations');
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
        onDownload={handleDownload}
        onSave={handleSave}
        onShare={handleShare}
        onRead={handleRead}
        showViewAll={false}
      />
    </MaterialsLayout>
  );
};

export default Recommendations;
