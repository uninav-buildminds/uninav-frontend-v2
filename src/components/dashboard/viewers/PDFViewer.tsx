/**
 * Custom PDF Viewer Component
 * Provides consistent PDF viewing experience across the platform
 * Revamped design for cleaner, more professional interface
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface PDFViewerProps {
  url: string;
  title?: string;
  currentPage?: number;
  totalPages?: number;
  zoom?: number;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onSearch?: () => void;
  showControls?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  url,
  title = "PDF Document",
  currentPage = 1,
  totalPages = 1,
  zoom = 100,
  onPreviousPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  showControls = true,
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className="h-full w-full bg-[#525659]">
      <div className="h-full w-full relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#525659] z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-white border-t-transparent mx-auto mb-3"></div>
              <p className="text-sm text-white">Loading PDF...</p>
            </div>
          </div>
        )}

        {error ? (
          <div className="h-full flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-lg font-medium mb-2">Failed to load PDF</p>
              <p className="text-sm opacity-80">
                The PDF could not be displayed. Try downloading it instead.
              </p>
            </div>
          </div>
        ) : (
          <iframe
            src={url}
            className="w-full h-full border-0"
            style={{
              minHeight: "100%",
              backgroundColor: "#525659",
            }}
            title={title}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
