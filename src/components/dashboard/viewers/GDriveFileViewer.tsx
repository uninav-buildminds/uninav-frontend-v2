/**
 * Google Drive File Viewer Component
 * Displays single Google Drive files using appropriate viewers
 */

import React, { useState, useEffect, useRef } from "react";
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Attachment01Icon, File01Icon, LockIcon, Triangle01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { getFileMetadata, GDriveFile } from "@/api/gdrive.api";
import { ENV } from "@/lib/env.config";
import {
  getGDriveUrls,
  getGoogleWorkspaceEmbedUrl,
} from "@/lib/utils/gdriveUtils";
import PDFViewer from "./PDFViewer";

interface GDriveFileViewerProps {
  fileId: string;
  mimeType?: string;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

const GDriveFileViewer: React.FC<GDriveFileViewerProps> = ({
  fileId,
  mimeType: propMimeType,
  zoom = 100,
  onZoomIn,
  onZoomOut,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<GDriveFile | null>(null);
  const [imageZoom, setImageZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    loadFileMetadata();

    // Cleanup blob URL on unmount or when fileId changes
    return () => {
      if (blobUrlRef.current) {
        window.URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [fileId]);

  const loadFileMetadata = async () => {
    setLoading(true);
    setError(null);
    setImageLoadError(false);

    try {
      const metadata = await getFileMetadata(fileId);
      setFileMetadata(metadata);

      // For images, fetch the actual file content directly
      if (metadata.mimeType.startsWith("image/")) {
        await loadImageContent(fileId);
      }
    } catch (err: any) {
      console.error("Error loading file metadata:", err);
      setError(err.message || "Failed to load file");
      toast.error(err.message || "Failed to load file");
    } finally {
      setLoading(false);
    }
  };

  const loadImageContent = async (fileId: string) => {
    try {
      const API_KEY = ENV.GOOGLE_DRIVE_API_KEY;
      if (!API_KEY) {
        throw new Error("Google Drive API key is not configured");
      }

      // Clean up previous blob URL if it exists
      if (blobUrlRef.current) {
        window.URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      // Fetch the actual image file content with alt=media
      const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to load image: ${response.statusText}`);
      }

      // Create a blob URL from the response
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Store in ref for cleanup
      blobUrlRef.current = blobUrl;
      setImageUrl(blobUrl);
    } catch (err: any) {
      console.error("Error loading image content:", err);
      setImageLoadError(true);
      // Fallback to preview URL (not a blob, so don't store in ref)
      setImageUrl(`https://drive.google.com/uc?export=view&id=${fileId}`);
    }
  };

  const mimeType = propMimeType || fileMetadata?.mimeType || "";

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error || !fileMetadata) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 bg-white rounded-lg">
        <div className="text-center max-w-md">
          <HugeiconsIcon icon={LockIcon} strokeWidth={1.5} size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Cannot Access File</p>
          <p className="text-sm text-gray-600">
            {error ||
              "This file may not be publicly accessible. Please contact the material uploader."}
          </p>
        </div>
      </div>
    );
  }

  // Handle PDF files with custom viewer
  if (mimeType === "application/pdf") {
    return (
      <PDFViewer
        url={getGDriveUrls(fileId).preview}
        title={fileMetadata.name}
        zoom={zoom}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        showControls={true}
      />
    );
  }

  // Handle Google Workspace files
  if (mimeType.includes("google-apps")) {
    let embedUrl = "";

    if (mimeType.includes("document")) {
      embedUrl = getGoogleWorkspaceEmbedUrl(fileId, "doc");
    } else if (mimeType.includes("spreadsheet")) {
      embedUrl = getGoogleWorkspaceEmbedUrl(fileId, "sheet");
    } else if (mimeType.includes("presentation")) {
      embedUrl = getGoogleWorkspaceEmbedUrl(fileId, "presentation");
    } else {
      // Unsupported Google Workspace file type
      return (
        <div className="h-full flex items-center justify-center text-gray-500 bg-white rounded-lg">
          <div className="text-center">
            <HugeiconsIcon icon={File01Icon} strokeWidth={1.5} size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">{fileMetadata.name}</p>
            <p className="text-sm text-gray-600">
              This file type cannot be previewed inline.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col bg-white rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          title={fileMetadata.name}
        />
      </div>
    );
  }

  // Handle images
  if (mimeType.startsWith("image/")) {
    const handleImageZoomIn = () => {
      setImageZoom((prev) => {
        // Use larger increments for zoom levels > 200%
        const increment = prev >= 200 ? 50 : 25;
        return Math.min(prev + increment, 1000);
      });
    };

    const handleImageZoomOut = () => {
      setImageZoom((prev) => {
        // Use larger decrements for zoom levels > 200%
        const decrement = prev > 200 ? 50 : 25;
        return Math.max(prev - decrement, 25);
      });
    };

    const handleResetZoom = () => {
      setImageZoom(100);
      setRotation(0);
    };

    const handleRotate = () => {
      setRotation((prev) => (prev + 90) % 360);
    };

    return (
      <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden relative">
        {/* Image Display Area - Now with better scrolling for deep zoom */}
        <div className="flex-1 overflow-auto relative">
          <div className="min-h-full min-w-full flex items-center justify-center p-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={fileMetadata.name}
                className="shadow-2xl"
                style={{
                  transform: `scale(${imageZoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                  transition: "transform 0.15s ease-out",
                  maxWidth: imageZoom > 100 ? "none" : "100%",
                  height: "auto",
                }}
                onError={(e) => {
                  console.error("Failed to load image");
                  setImageLoadError(true);
                }}
              />
            ) : (
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
                <p className="text-sm">Loading image...</p>
              </div>
            )}
          </div>
        </div>

        {/* Error overlay if image fails to load */}
        {imageLoadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95">
            <div className="text-center text-white max-w-md px-4">
              <HugeiconsIcon icon={Triangle01Icon} strokeWidth={1.5}
                size={48}
                className="mx-auto mb-4 text-yellow-400" />
              <p className="text-lg font-medium mb-2">Failed to load image</p>
              <p className="text-sm text-gray-400">
                The image could not be displayed. It may not be publicly
                accessible.
              </p>
            </div>
          </div>
        )}

        {/* Zoom Controls - Bottom Center */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gray-800/95 backdrop-blur-sm rounded-full px-3 py-2 border border-gray-700 shadow-xl">
          <button
            onClick={handleImageZoomOut}
            disabled={imageZoom <= 25}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut size={18} className="text-white" />
          </button>

          <div className="px-2 min-w-[4rem] text-center">
            <span className="text-xs font-medium text-white">{imageZoom}%</span>
          </div>

          <button
            onClick={handleImageZoomIn}
            disabled={imageZoom >= 1000}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn size={18} className="text-white" />
          </button>

          <div className="h-6 w-px bg-gray-600 mx-1"></div>

          <button
            onClick={handleResetZoom}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Reset zoom"
            title="Reset zoom & rotation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>

          <div className="h-6 w-px bg-gray-600 mx-1"></div>

          <button
            onClick={handleRotate}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Rotate"
            title="Rotate 90°"
          >
            <RotateCw size={18} className="text-white" />
          </button>
        </div>
      </div>
    );
  }

  // Handle videos
  if (mimeType.startsWith("video/")) {
    return (
      <div className="h-full flex flex-col bg-white rounded-lg overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-black">
          <iframe
            src={getGDriveUrls(fileId).preview}
            className="w-full h-full border-0"
            title={fileMetadata.name}
            allow="autoplay"
          />
        </div>
      </div>
    );
  }

  // Handle other Microsoft Office files (Word, Excel, PowerPoint)
  if (
    mimeType.includes("officedocument") ||
    mimeType.includes("msword") ||
    mimeType.includes("ms-excel") ||
    mimeType.includes("ms-powerpoint") ||
    mimeType.includes("application/vnd.ms-")
  ) {
    // Use Google Drive's viewer for Office files
    const viewerUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    return (
      <div className="h-full flex flex-col bg-white rounded-lg overflow-hidden">
        <iframe
          src={viewerUrl}
          className="w-full h-full border-0"
          title={fileMetadata.name}
          allow="autoplay"
        />
      </div>
    );
  }

  // Fallback for unsupported file types
  return (
    <div className="h-full flex items-center justify-center text-gray-500 bg-white rounded-lg">
      <div className="text-center">
        <HugeiconsIcon icon={Attachment01Icon} strokeWidth={1.5} size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">{fileMetadata.name}</p>
        <p className="text-sm text-gray-600">
          This file type cannot be previewed inline.
        </p>
      </div>
    </div>
  );
};

export default GDriveFileViewer;
