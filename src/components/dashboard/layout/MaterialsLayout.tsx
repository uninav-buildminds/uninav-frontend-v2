import React from 'react';
import DashboardLayout from './DashboardLayout';
import PageHeader from './PageHeader';

interface MaterialsLayoutProps {
  title: string;
  children: React.ReactNode;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  searchPlaceholder?: string;
  searchSuggestions?: string[];
}

const MaterialsLayout: React.FC<MaterialsLayoutProps> = ({
  title,
  children,
  onSearch,
  onFilter,
  searchPlaceholder = "Search materials...",
  searchSuggestions = []
}) => {
  return (
    <DashboardLayout>
      <PageHeader 
        title={title}
        subtitle="Browse and manage your materials"
        searchPlaceholder={searchPlaceholder}
        searchSuggestions={searchSuggestions}
        onSearch={onSearch}
      />
      <div className="p-4 sm:p-6">

        {/* Content */}
        <div className="space-y-6 pb-16 md:pb-0">
          {children}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MaterialsLayout;
