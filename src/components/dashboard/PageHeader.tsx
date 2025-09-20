import React from "react";
import SimpleSearchBar from "./SimpleSearchBar";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  searchSuggestions?: string[];
  onSearch?: (query: string) => void;
  showSearch?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  searchPlaceholder = "Search materials...",
  searchSuggestions = [],
  onSearch,
  showSearch = true
}) => {
  return (
    <section className="relative overflow-visible z-sticky">
      {/* Gradient background */}
      <div className="bg-gradient-to-br from-[theme(colors.dashboard.gradientFrom)] to-[theme(colors.dashboard.gradientTo)]">
        <div className="px-2 sm:px-4 pt-10 sm:pt-14 pb-6 sm:pb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground">{title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{subtitle}</p>

            {/* Search */}
            {showSearch && (
              <div className="mt-6 flex justify-center">
                <SimpleSearchBar 
                  className="w-full max-w-xl"
                  placeholder={searchPlaceholder}
                  suggestions={searchSuggestions}
                  onSearch={onSearch || ((query) => console.log('Page search:', query))}
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

export default PageHeader;
