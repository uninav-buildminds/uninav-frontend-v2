import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft01Icon } from "hugeicons-react";
import PageHeader from "./PageHeader";

interface MaterialsLayoutProps {
  title: string;
  children: React.ReactNode;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  searchPlaceholder?: string;
  searchSuggestions?: string[];
  showBackButton?: boolean;
  backTo?: string;
}

const MaterialsLayout: React.FC<MaterialsLayoutProps> = ({
  title,
  children,
  onSearch,
  onFilter,
  searchPlaceholder = "Search materials...",
  searchSuggestions = [],
  showBackButton = false,
  backTo,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      {/* Back Button - Fixed position for mobile, inline for desktop */}
      {showBackButton && (
        <>
          {/* Mobile: Fixed button at top-left */}
          <button
            onClick={handleBack}
            className="md:hidden fixed left-3 sm:left-4 top-3 sm:top-4 z-50 p-2 sm:p-2.5 bg-white/90 backdrop-blur hover:bg-white border border-gray-200 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft01Icon size={18} className="text-gray-700" />
          </button>
          {/* Desktop: Inline button in header area */}
          <div className="hidden md:block absolute left-4 sm:left-6 top-16 sm:top-20 z-10">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft01Icon size={18} />
              <span>Back</span>
            </button>
          </div>
        </>
      )}
      <PageHeader
        title={title}
        subtitle="Browse and manage your materials"
        searchPlaceholder={searchPlaceholder}
        searchSuggestions={searchSuggestions}
        onSearch={onSearch}
      />
      <div className="p-4 sm:p-6">
        {/* Content */}
        <div className="space-y-6 pb-16 md:pb-0">{children}</div>
      </div>
    </>
  );
};

export default MaterialsLayout;
