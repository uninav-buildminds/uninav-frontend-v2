import React from 'react';
import DashboardLayout from './DashboardLayout';
import PageHeader from './PageHeader';
import { PreferenceHorizontalIcon } from 'hugeicons-react';

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
        {/* Filter Bar */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={onFilter}
            className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <PreferenceHorizontalIcon size={16} />
            Filter
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 pb-16 md:pb-0">
          {children}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MaterialsLayout;
