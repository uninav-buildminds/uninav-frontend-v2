/**
 * Google Drive File Viewer Component
 * Displays single Google Drive files using appropriate viewers
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { getFileMetadata, GDriveFile } from "@/api/gdrive.api";
import {
  getGDriveUrls,
  getGoogleWorkspaceEmbedUrl,
  extractGDriveId,
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

  useEffect(() => {
    loadFileMetadata();
  }, [fileId]);

  const loadFileMetadata = async () => {
    setLoading(true);
    setError(null);

    try {
      const metadata = await getFileMetadata(fileId);
      setFileMetadata(metadata);
    } catch (err: any) {
      console.error("Error loading file metadata:", err);
      setError(err.message || "Failed to load file");
      toast.error(err.message || "Failed to load file");
    } finally {
      setLoading(false);
    }
  };

  const mimeType = propMimeType || fileMetadata?.mimeType || "";

  const handleDownload = () => {
    if (fileMetadata?.webContentLink) {
      window.open(fileMetadata.webContentLink, "_blank");
      toast.success("Download started!");
    } else {
      const urls = getGDriveUrls(fileId);
      window.open(urls.view, "_blank");
      toast.info("Opening in Google Drive...");
    }
  };

  const handleOpenInDrive = () => {
    if (fileMetadata?.webViewLink) {
      window.open(fileMetadata.webViewLink, "_blank");
    } else {
      window.open(getGDriveUrls(fileId).view, "_blank");
    }
  };

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
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-lg font-medium mb-2">Cannot Access File</p>
          <p className="text-sm text-gray-600 mb-4">
            {error || "This file may not be publicly accessible."}
          </p>
          <Button onClick={handleOpenInDrive} variant="outline">
            <ExternalLink size={16} className="mr-2" />
            Try Opening in Google Drive
          </Button>
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
            <div className="text-4xl mb-4">📄</div>
            <p className="text-lg font-medium mb-2">{fileMetadata.name}</p>
            <p className="text-sm text-gray-600 mb-4">
              This file type cannot be previewed inline.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleOpenInDrive}>
                <ExternalLink size={16} className="mr-2" />
                Open in Google Drive
              </Button>
              <Button onClick={handleDownload} variant="outline">
                <Download size={16} className="mr-2" />
                Download
              </Button>
            </div>
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
    // Use direct Google Drive image URL for better compatibility
    const imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    return (
      <div className="h-full flex flex-col bg-white rounded-lg overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
          <img
            src={imageUrl}
            alt={fileMetadata.name}
            className="max-w-full max-h-full object-contain rounded shadow-lg"
            style={{ transform: `scale(${zoom / 100})` }}
            onError={(e) => {
              // Fallback to thumbnail if direct link fails
              const target = e.target as HTMLImageElement;
              if (
                fileMetadata.thumbnailLink &&
                target.src !== fileMetadata.thumbnailLink
              ) {
                target.src = fileMetadata.thumbnailLink;
              } else {
                // Show error state
                target.style.display = "none";
              }
            }}
          />
        </div>
        <div className="p-3 border-t border-gray-200 flex justify-center gap-2">
          <Button onClick={handleDownload} size="sm">
            <Download size={16} className="mr-2" />
            Download
          </Button>
          <Button onClick={handleOpenInDrive} size="sm" variant="outline">
            <ExternalLink size={16} className="mr-2" />
            Open in Drive
          </Button>
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
        <div className="p-3 border-t border-gray-200 flex justify-center gap-2">
          <Button onClick={handleDownload} size="sm">
            <Download size={16} className="mr-2" />
            Download
          </Button>
          <Button onClick={handleOpenInDrive} size="sm" variant="outline">
            <ExternalLink size={16} className="mr-2" />
            Open in Drive
          </Button>
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
        <div className="p-2 border-t border-gray-200 flex justify-center gap-2 bg-gray-50">
          <Button onClick={handleDownload} size="sm">
            <Download size={16} className="mr-2" />
            Download
          </Button>
          <Button onClick={handleOpenInDrive} size="sm" variant="outline">
            <ExternalLink size={16} className="mr-2" />
            Open in Drive
          </Button>
        </div>
      </div>
    );
  }

  // Fallback for unsupported file types
  return (
    <div className="h-full flex items-center justify-center text-gray-500 bg-white rounded-lg">
      <div className="text-center">
        <div className="text-4xl mb-4">📎</div>
        <p className="text-lg font-medium mb-2">{fileMetadata.name}</p>
        <p className="text-sm text-gray-600 mb-4">
          This file type cannot be previewed inline.
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={handleDownload}>
            <Download size={16} className="mr-2" />
            Download File
          </Button>
          <Button onClick={handleOpenInDrive} variant="outline">
            <ExternalLink size={16} className="mr-2" />
            Open in Google Drive
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GDriveFileViewer;
