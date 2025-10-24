/**
 * Adobe PDF Embed API Viewer Component
 * Mobile-friendly PDF viewer using Adobe's embed API
 * Provides better mobile browser compatibility than iframe
 *
 * Setup Instructions:
 * 1. Get a free Adobe client ID from: https://developer.adobe.com/document-services/docs/overview/pdf-embed-api/gettingstarted/
 * 2. Add VITE_ADOBE_CLIENT_ID=your_client_id_here to your .env file
 * 3. The component will automatically load the Adobe PDF Embed API script
 *
 * Features:
 * - Better mobile browser compatibility
 * - Built-in zoom controls
 * - Page navigation
 * - Fullscreen support
 * - Clean, professional interface
 *
 * Performance Optimizations:
 * - Proper viewer disposal and container clearing
 * - Debounced initialization to prevent rapid re-renders
 * - Hardware acceleration and smooth scrolling
 * - Disabled unnecessary features (analytics, annotations)
 * - Optimized embed configuration for better performance
 */

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface AdobePDFViewerProps {
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

// Extend Window interface for AdobeDC
declare global {
  interface Window {
    AdobeDC: any;
  }
}

const AdobePDFViewer: React.FC<AdobePDFViewerProps> = ({
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [adobeLoaded, setAdobeLoaded] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const adobeViewRef = useRef<any>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout>();
  const loadingRef = useRef(true);
  const viewerId = useRef(
    `adobe-dc-view-${Math.random().toString(36).substr(2, 9)}`
  );

  // Load Adobe PDF Embed API script
  useEffect(() => {
    const loadAdobeScript = () => {
      console.log("Loading Adobe PDF Embed API script...");

      // Check if AdobeDC is already loaded
      if (window.AdobeDC) {
        console.log("AdobeDC already available, skipping script load");
        setAdobeLoaded(true);
        return;
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="view-sdk"]')) {
        console.log("Adobe script already exists, waiting for it to load...");
        // Wait for it to load with timeout
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds timeout
        const checkAdobe = setInterval(() => {
          attempts++;
          if (window.AdobeDC) {
            console.log("AdobeDC became available from existing script");
            setAdobeLoaded(true);
            clearInterval(checkAdobe);
          } else if (attempts >= maxAttempts) {
            console.error("Timeout waiting for Adobe PDF Embed API to load");
            setError(true);
            setLoading(false);
            clearInterval(checkAdobe);
          }
        }, 100);
        return;
      }

      // Load the Adobe PDF Embed API script
      const script = document.createElement("script");
      script.src = "https://acrobatservices.adobe.com/view-sdk/viewer.js";
      script.async = true;
      script.onload = () => {
        console.log("Adobe script onload event fired");
        // Wait for AdobeDC to be available on window object
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds timeout
        const checkAdobeDC = setInterval(() => {
          attempts++;
          console.log(`Checking for AdobeDC... attempt ${attempts}`);
          if (window.AdobeDC) {
            console.log("Adobe PDF Embed API loaded successfully");
            setAdobeLoaded(true);
            clearInterval(checkAdobeDC);
          } else if (attempts >= maxAttempts) {
            console.error(
              "Timeout waiting for AdobeDC to be available after script load"
            );
            setError(true);
            setLoading(false);
            clearInterval(checkAdobeDC);
          }
        }, 100);
      };
      script.onerror = () => {
        console.error("Failed to load Adobe PDF Embed API");
        setError(true);
        setLoading(false);
      };
      document.head.appendChild(script);
    };

    loadAdobeScript();
  }, []);

  // Initialize Adobe PDF viewer with debouncing
  useEffect(() => {
    if (!adobeLoaded || !viewerRef.current || !url) return;

    // Clear any existing timeout
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
    }

    // Debounce initialization to prevent rapid re-initializations
    initTimeoutRef.current = setTimeout(() => {
      initializeViewer();
    }, 100);

    const initializeViewer = async () => {
      try {
        setLoading(true);
        loadingRef.current = true;
        setError(false);

        // Debug logging
        console.log("Adobe PDF Viewer: Initializing...");
        console.log("AdobeDC available:", !!window.AdobeDC);
        console.log("PDF URL:", url);

        // AdobeDC should be available at this point since adobeLoaded is true
        // But let's add a safety check just in case
        if (!window.AdobeDC) {
          console.error(
            "AdobeDC is not available on window object - this shouldn't happen"
          );
          // Try waiting a bit more
          setTimeout(() => {
            if (window.AdobeDC) {
              console.log("AdobeDC became available after delay, retrying...");
              initializeViewer();
            } else {
              setError(true);
              setLoading(false);
            }
          }, 500);
          return;
        }

        // Get Adobe client ID from environment variables
        const clientId = import.meta.env.VITE_ADOBE_CLIENT_ID;

        if (!clientId) {
          console.error(
            "Adobe client ID not found. Please set VITE_ADOBE_CLIENT_ID in your environment variables."
          );
          console.error(
            "Get your free client ID from: https://developer.adobe.com/document-services/docs/overview/pdf-embed-api/gettingstarted/"
          );
          console.error(
            "For testing purposes, you can use a demo client ID, but it may have limitations."
          );
          setError(true);
          setLoading(false);
          return;
        }

        console.log("Using client ID:", clientId.substring(0, 10) + "...");

        // Clear any existing viewer and container content
        if (adobeViewRef.current) {
          try {
            // Properly dispose of the existing viewer
            if (typeof adobeViewRef.current.dispose === "function") {
              adobeViewRef.current.dispose();
            }
            adobeViewRef.current = null;
          } catch (error) {
            console.warn("Error disposing previous viewer:", error);
          }
        }

        // Clear the container content to prevent conflicts
        const container = document.getElementById(viewerId.current);
        if (container) {
          container.innerHTML = "";
        }

        // Initialize Adobe PDF viewer
        const adobeDCView = new window.AdobeDC.View({
          clientId: clientId,
          divId: viewerId.current,
        });

        adobeViewRef.current = adobeDCView;

        // Helper function to stop loading and clear any errors
        const stopLoading = () => {
          loadingRef.current = false;
          setLoading(false);
          setError(false); // Clear any previous errors when PDF loads successfully
        };

        // Add fallback timeout to prevent infinite loading
        const loadingTimeout = setTimeout(() => {
          console.log("Adobe PDF loading timeout - forcing loading to false");
          stopLoading();
        }, 10000); // 10 second timeout

        // Add event listeners for better debugging
        try {
          adobeDCView.registerCallback(
            window.AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
            function (event) {
              console.log("Adobe PDF Event:", event.type);
              if (
                event.type === "DOCUMENT_OPEN" ||
                event.type === "PAGE_RENDER"
              ) {
                console.log("PDF document ready");
                clearTimeout(loadingTimeout);
                stopLoading();
              }
            },
            { enablePDFAnalytics: false }
          );
        } catch (callbackError) {
          console.warn("Could not register Adobe callback:", callbackError);
          // If callback registration fails, use timeout only
        }

        // Preview the PDF file with optimized settings
        await adobeDCView.previewFile(
          {
            content: {
              location: {
                url: url,
              },
            },
            metaData: {
              fileName: title,
            },
          },
          {
            embedMode: "SIZED_CONTAINER",
            // embedMode: "IN_LINE",
            defaultViewMode: "CONTINUOUS", // Use continuous scrolling to prevent blank pages
            showDownloadPDF: false, // Hide download button (we have our own)
            showPrintPDF: false, // Hide print button
            showAnnotationTools: false, // Hide annotation tools for cleaner interface
            showLeftHandPanel: false, // Hide left panel for more space
            showFullScreen: false, // Allow fullscreen
            enableFormFilling: false, // Disable form filling
            showZoomControl: true, // Show zoom controls
            showPageControls: true, // Show page navigation
            showBookmarks: false, // Hide bookmarks for cleaner interface
            // Performance optimizations
            enableLinearization: true, // Enable fast web view for better streaming
            enablePDFAnalytics: false, // Disable analytics for better performance
            includePDFAnnotations: false, // Disable annotations for better performance
            // Mobile optimizations
            enableSearchAPIs: false, // Disable search APIs if not needed for performance
            allowFullScreen: true,
            exitPDFViewerType: "RETURN",
            // Ensure pages are pre-rendered
            preloadPageCount: 2, // Reduce preload for mobile performance
            // Mobile-specific settings
            fitMode: "actualSize", // Better for mobile viewing
            showThumbnails: false, // Hide thumbnails on mobile for more space
          }
        );

        // If previewFile completes successfully, also set loading to false as fallback
        console.log("Adobe previewFile completed successfully");

        // Immediate fallback - if previewFile completed, assume it's ready
        setTimeout(() => {
          if (loadingRef.current) {
            console.log("Adobe PDF immediate fallback - previewFile completed");
            clearTimeout(loadingTimeout);
            stopLoading();
          }
        }, 1000); // 1 second after previewFile completes

        // Additional fallback - if no events fired within 3 seconds, assume it's loaded
        setTimeout(() => {
          if (loadingRef.current) {
            console.log(
              "Adobe PDF secondary fallback - assuming loaded after 3 seconds"
            );
            clearTimeout(loadingTimeout);
            stopLoading();
          }
        }, 3000);
      } catch (error) {
        console.error("Error initializing Adobe PDF viewer:", error);
        setError(true);
        setLoading(false);
      }
    };

    // Cleanup function
    return () => {
      // Clear timeout
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }

      if (adobeViewRef.current) {
        try {
          // Properly dispose of the viewer
          if (typeof adobeViewRef.current.dispose === "function") {
            adobeViewRef.current.dispose();
          }
          adobeViewRef.current = null;

          // Clear the container content
          const container = document.getElementById(viewerId.current);
          if (container) {
            container.innerHTML = "";
          }
        } catch (error) {
          console.error("Error cleaning up Adobe viewer:", error);
        }
      }
    };
  }, [adobeLoaded, url, title]);

  // Handle zoom changes
  useEffect(() => {
    if (adobeViewRef.current && zoom !== 100) {
      try {
        // Adobe viewer handles zoom internally, but we can trigger it
        // The zoom prop is mainly for compatibility with the existing interface
      } catch (error) {
        console.error("Error applying zoom:", error);
      }
    }
  }, [zoom]);

  return (
    <div className="h-full w-full bg-[#525659] relative">
      <div className="h-full w-full relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#525659] z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-white border-t-transparent mx-auto mb-3"></div>
              <p className="text-sm text-white">Loading PDF...</p>
            </div>
          </div>
        )}

        {error && loading ? (
          <div className="h-full flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-lg font-medium mb-2">Failed to load PDF</p>
              <p className="text-sm opacity-80">
                The PDF could not be displayed. This may be due to missing Adobe
                configuration or network issues.
              </p>
              <p className="text-xs opacity-60 mt-2">
                Check console for setup instructions.
              </p>
            </div>
          </div>
        ) : (
          <div
            id={viewerId.current}
            ref={viewerRef}
            className="w-full h-full"
            style={{
              minHeight: "100%",
              // The parent container now handles scrolling
              overflow: "visible",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdobePDFViewer;
