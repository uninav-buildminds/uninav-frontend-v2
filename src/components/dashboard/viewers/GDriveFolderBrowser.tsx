/**
 * Google Drive Folder Browser Component
 * Allows users to browse folders and files from Google Drive
 */

import React, { useState, useEffect } from "react";
import { ChevronRight, Download, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { listFolderFiles, getFileMetadata, GDriveFile } from "@/api/gdrive.api";
import {
  extractGDriveId,
  getFileIcon,
  formatFileSize,
  isViewableInline,
  getGDriveUrls,
} from "@/lib/utils/gdriveUtils";

interface Breadcrumb {
  id: string;
  name: string;
}

interface GDriveFolderBrowserProps {
  folderId: string;
  folderName?: string;
  onViewFile?: (fileId: string, mimeType: string) => void;
}

const GDriveFolderBrowser: React.FC<GDriveFolderBrowserProps> = ({
  folderId,
  folderName = "Root",
  onViewFile,
}) => {
  const [files, setFiles] = useState<GDriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([
    { id: folderId, name: folderName },
  ]);
  const [currentFolderId, setCurrentFolderId] = useState(folderId);

  useEffect(() => {
    loadFolderContents(currentFolderId);
  }, [currentFolderId]);

  const loadFolderContents = async (folderId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await listFolderFiles(folderId);
      setFiles(result.files);
    } catch (err: any) {
      console.error("Error loading folder:", err);
      setError(err.message || "Failed to load folder contents");
      toast.error(err.message || "Failed to load folder contents");
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = async (folder: GDriveFile) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentFolderId(newBreadcrumbs[newBreadcrumbs.length - 1].id);
  };

  const handleFileClick = (file: GDriveFile) => {
    if (isViewableInline(file.mimeType)) {
      if (onViewFile) {
        onViewFile(file.id, file.mimeType);
      } else {
        // Open in new tab
        window.open(file.webViewLink || getGDriveUrls(file.id).view, "_blank");
      }
    } else {
      toast.info(
        "This file type cannot be previewed. Use the download button."
      );
    }
  };

  const handleDownload = (file: GDriveFile, e: React.MouseEvent) => {
    e.stopPropagation();

    if (file.webContentLink) {
      window.open(file.webContentLink, "_blank");
      toast.success("Download started!");
    } else {
      // Fallback to view link
      window.open(file.webViewLink || getGDriveUrls(file.id).view, "_blank");
      toast.info("Opening file in Google Drive...");
    }
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-lg font-medium mb-2">Access Restricted</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <p className="text-xs text-gray-500">
            This content may not be publicly accessible. Please contact the
            material uploader.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg overflow-hidden">
      {/* Breadcrumb Navigation */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 text-sm overflow-x-auto">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                  index === breadcrumbs.length - 1
                    ? "bg-brand text-white font-medium"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {crumb.name}
              </button>
              {index < breadcrumbs.length - 1 && (
                <ChevronRight
                  size={16}
                  className="text-gray-400 flex-shrink-0"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="animate-spin h-8 w-8 text-brand mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading contents...</p>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📁</div>
              <p className="text-sm">This folder is empty</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {files.map((file) => {
              const isFolder =
                file.mimeType === "application/vnd.google-apps.folder";
              const icon = getFileIcon(file.mimeType);
              const canView = isViewableInline(file.mimeType);

              return (
                <div
                  key={file.id}
                  onClick={() =>
                    isFolder ? handleFolderClick(file) : handleFileClick(file)
                  }
                  className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 transition-all ${
                    isFolder || canView
                      ? "cursor-pointer hover:border-brand hover:bg-brand/5"
                      : "cursor-default"
                  }`}
                >
                  {/* Icon/Thumbnail */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {file.thumbnailLink ? (
                      <img
                        src={file.thumbnailLink}
                        alt={file.name}
                        className="w-12 h-12 rounded object-cover"
                        onError={(e) => {
                          // If thumbnail fails to load, replace with icon
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (parent) {
                            target.style.display = "none";
                            const iconSpan = document.createElement("span");
                            iconSpan.className = "text-3xl";
                            iconSpan.textContent = icon;
                            parent.appendChild(iconSpan);
                          }
                        }}
                      />
                    ) : (
                      <span className="text-3xl">{icon}</span>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    {file.size && (
                      <p className="text-xs text-gray-500">
                        {formatFileSize(parseInt(file.size))}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isFolder && canView && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileClick(file);
                        }}
                        className="gap-1"
                      >
                        <Eye size={14} />
                        View
                      </Button>
                    )}
                    {!isFolder && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleDownload(file, e)}
                        className="gap-1"
                      >
                        <Download size={14} />
                        Download
                      </Button>
                    )}
                    {isFolder && (
                      <ChevronRight size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GDriveFolderBrowser;
