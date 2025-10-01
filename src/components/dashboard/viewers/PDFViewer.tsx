/**
 * Custom PDF Viewer Component
 * Provides consistent PDF viewing experience across the platform
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Maximize01Icon,
  Minimize01Icon,
  Search01Icon,
} from 'hugeicons-react';

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
  title = 'PDF Document',
  currentPage = 1,
  totalPages = 1,
  zoom = 100,
  onPreviousPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onSearch,
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
    <div className="h-full flex flex-col">
      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm text-gray-700 font-medium min-w-[80px] text-center">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight size={16} />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onZoomOut}>
              <Minimize01Icon size={16} />
            </Button>
            <span className="text-sm text-gray-700 font-medium min-w-[3rem] text-center">
              {zoom}%
            </span>
            <Button variant="outline" size="sm" onClick={onZoomIn}>
              <Maximize01Icon size={16} />
            </Button>
            {onSearch && (
              <Button variant="outline" size="sm" onClick={onSearch}>
                <Search01Icon size={16} />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* PDF Container */}
      <div className="flex-1 bg-gray-100 p-4 overflow-hidden">
        <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Loading PDF...</p>
              </div>
            </div>
          )}

          {error ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <p className="text-lg font-medium mb-2">Failed to load PDF</p>
                <p className="text-sm text-gray-600">
                  The PDF could not be displayed. Try downloading it instead.
                </p>
              </div>
            </div>
          ) : (
            <iframe
              src={url}
              className="w-full h-full border-0"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
              }}
              title={title}
              onLoad={handleLoad}
              onError={handleError}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;

