/**
 * React-PDF Viewer Component
 * Optimized mobile-friendly PDF viewer using react-pdf and PDF.js
 *
 * Features:
 * - Continuous vertical scrolling
 * - Simple and reliable rendering
 * - Web worker for async rendering
 * - Touch-friendly controls
 * - Responsive scaling
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Alert02Icon } from "hugeicons-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const workerSrc = "/pdf.worker.min.mjs";

// Configure PDF.js worker for async rendering
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

interface ReactPdfViewerProps {
  url: string;
  title?: string;
  showControls?: boolean;
  onPageChange?: (currentPage: number, totalPages: number) => void;
  initialPage?: number; // Page to scroll to on load
}

const ReactPdfViewer: React.FC<ReactPdfViewerProps> = ({
  url,
  title = "PDF Document",
  showControls = true,
  onPageChange,
  initialPage,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [currentPage, setCurrentPage] = useState<number>(initialPage || 1);
  const [pageInput, setPageInput] = useState<string>("1");
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const onPageChangeRef = useRef(onPageChange);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    onPageChangeRef.current = onPageChange;
  }, [onPageChange]);

  // Calculate responsive width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 32);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Handle document load success
  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      console.log(`PDF loaded successfully: ${numPages} pages`);
    },
    []
  );

  // Scroll to initial page after document loads and pages render
  useEffect(() => {
    if (!numPages || !initialPage || initialPage === 1) return;

    // Wait for pages to render, then scroll to initial page
    const timer = setTimeout(() => {
      const pageElement = pageRefs.current.get(initialPage);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: "auto", block: "start" });
        console.log(`Scrolled to page ${initialPage}`);
      }
    }, 500); // Give pages time to render

    return () => clearTimeout(timer);
  }, [numPages, initialPage]);

  // Track current page based on scroll position
  useEffect(() => {
    if (!containerRef.current || !numPages) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerTop = container.getBoundingClientRect().top;

      // Find the page closest to the top of viewport
      let closestPage = 1;
      let closestDistance = Infinity;

      pageRefs.current.forEach((pageElement, pageNum) => {
        const rect = pageElement.getBoundingClientRect();
        const distance = Math.abs(rect.top - containerTop);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestPage = pageNum;
        }
      });

      if (closestPage !== currentPage) {
        setCurrentPage(closestPage);
        setPageInput(closestPage.toString());

        // Notify parent component of page change
        if (onPageChangeRef.current && numPages) {
          onPageChangeRef.current(closestPage, numPages);
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [numPages, currentPage]);

  // Go to specific page
  const goToPage = (page: number) => {
    const pageElement = pageRefs.current.get(page);
    if (pageElement && containerRef.current) {
      pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Handle page input change
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  // Handle page input submit
  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput);
    if (numPages && page >= 1 && page <= numPages) {
      goToPage(page);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  // Zoom handlers
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.5));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));

  return (
    <div className="h-full w-full bg-[#525659] relative">
      {/* Floating Page Navigator - Bottom Center */}
      {numPages && (
        <form
          onSubmit={handlePageInputSubmit}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur text-white px-3 py-1.5 rounded-full flex items-center gap-2"
        >
          <input
            type="number"
            value={pageInput}
            onChange={handlePageInputChange}
            onFocus={(e) => e.target.select()}
            min={1}
            max={numPages}
            className="w-10 bg-transparent text-center text-xs font-medium outline-none border-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-xs text-gray-300">/</span>
          <span className="text-xs font-medium">{numPages}</span>
        </form>
      )}

      {/* Floating Zoom Controls - Bottom Right */}
      {showControls && numPages && (
        <div className="fixed bottom-6 right-4 z-50 flex items-center gap-2 bg-black/80 backdrop-blur rounded-full px-2 py-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.6}
            className="h-7 w-7 p-0 text-white hover:bg-white/20 disabled:opacity-30"
          >
            <ZoomOut size={16} />
          </Button>
          <span className="text-xs text-white min-w-[2.5rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 2.5}
            className="h-7 w-7 p-0 text-white hover:bg-white/20 disabled:opacity-30"
          >
            <ZoomIn size={16} />
          </Button>
        </div>
      )}

      {/* PDF Viewer Container */}
      <div
        ref={containerRef}
        className="h-full overflow-auto bg-[#525659] p-4"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-3"></div>
                <p className="text-sm text-white">Loading PDF...</p>
              </div>
            </div>
          }
          error={
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center max-w-md px-4">
                <div className="mb-4 flex justify-center">
                  <Alert02Icon size={48} className="text-white" />
                </div>
                <p className="text-lg font-medium mb-2">Failed to load PDF</p>
                <p className="text-sm opacity-80">
                  Could not display the PDF. Please try again.
                </p>
              </div>
            </div>
          }
        >
          {numPages && (
            <div className="flex flex-col items-center gap-4">
              {Array.from({ length: numPages }, (_, i) => i + 1).map(
                (pageNumber) => (
                  <div
                    key={`page_${pageNumber}`}
                    ref={(el) => {
                      if (el) pageRefs.current.set(pageNumber, el);
                      else pageRefs.current.delete(pageNumber);
                    }}
                  >
                    <Page
                      pageNumber={pageNumber}
                      width={
                        containerWidth ? containerWidth * scale : undefined
                      }
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className="shadow-lg bg-white"
                    />
                  </div>
                )
              )}
            </div>
          )}
        </Document>
      </div>
    </div>
  );
};

export default ReactPdfViewer;
