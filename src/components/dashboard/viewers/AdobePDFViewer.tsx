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

  // Initialize Adobe PDF viewer
  useEffect(() => {
    if (!adobeLoaded || !viewerRef.current || !url) return;

    const initializeViewer = async () => {
      try {
        setLoading(true);
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

        // Clear any existing viewer
        if (adobeViewRef.current) {
          adobeViewRef.current = null;
        }

        // Initialize Adobe PDF viewer
        const adobeDCView = new window.AdobeDC.View({
          clientId: clientId,
          divId: viewerId.current,
        });

        adobeViewRef.current = adobeDCView;

        // Preview the PDF file
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
            embedMode: "IN_LINE", // Use 'FULL_WINDOW' for fullscreen experience
            defaultViewMode: "FIT_WIDTH", // Better for mobile
            showDownloadPDF: false, // Hide download button (we have our own)
            showPrintPDF: false, // Hide print button
            showAnnotationTools: false, // Hide annotation tools for cleaner interface
            showLeftHandPanel: false, // Hide left panel for more space
            showFullScreen: true, // Allow fullscreen
            enableFormFilling: false, // Disable form filling
            showZoomControl: true, // Show zoom controls
            showPageControls: true, // Show page navigation
            showBookmarks: false, // Hide bookmarks for cleaner interface
          }
        );

        setLoading(false);
      } catch (error) {
        console.error("Error initializing Adobe PDF viewer:", error);
        setError(true);
        setLoading(false);
      }
    };

    initializeViewer();

    // Cleanup function
    return () => {
      if (adobeViewRef.current) {
        try {
          adobeViewRef.current = null;
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

        {error ? (
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
            style={{ minHeight: "100%" }}
          />
        )}
      </div>
    </div>
  );
};

export default AdobePDFViewer;
