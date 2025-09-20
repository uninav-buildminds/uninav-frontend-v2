import React from "react";
import SearchBar from "../shared/SearchBar";

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'course' | 'material';
  subtitle?: string;
  icon?: React.ReactNode;
}

interface DashboardHeaderProps {
  firstName?: string;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchSuggestions?: SearchSuggestion[];
  onSearch?: (query: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  firstName = "Tee",
  title,
  subtitle,
  showSearch = true,
  searchPlaceholder = "Enter a course code or course title",
  searchSuggestions = [],
  onSearch
}) => {
  // Default content for dashboard overview
  const defaultTitle = `Welcome back, ${firstName}! 👋`;
  const defaultSubtitle = "Ready to explore today?";
  
  const headerTitle = title || defaultTitle;
  const headerSubtitle = subtitle || defaultSubtitle;

  return (
    <section className="relative overflow-visible z-sticky">
      {/* Gradient background */}
      <div className="bg-gradient-to-br from-[theme(colors.dashboard.gradientFrom)] to-[theme(colors.dashboard.gradientTo)]">
        <div className="px-2 sm:px-4 pt-10 sm:pt-14 pb-6 sm:pb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground">{headerTitle}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{headerSubtitle}</p>

            {/* Search */}
            {showSearch && (
              <div className="mt-6 flex justify-center">
                <SearchBar 
                  className="w-full max-w-xl"
                  placeholder={searchPlaceholder}
                  suggestions={searchSuggestions}
                  onSearch={onSearch || ((query) => console.log('Dashboard search:', query))}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Fade into content below */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-10 bg-gradient-to-b from-transparent to-white" />
    </section>
  );
};

export default DashboardHeader;
