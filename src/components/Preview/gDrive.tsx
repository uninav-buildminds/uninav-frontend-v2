import React, { useState, useEffect } from "react";

interface GDrivePreviewProps {
  url: string;
  width?: number;
  height?: number;
  className?: string;
}

// Utility function to check if URL is a Google Drive URL
export const checkIsGoogleDriveUrl = (url: string): boolean => {
  return url.includes("drive.google.com") || url.includes("docs.google.com");
};

export const GDrivePreview: React.FC<GDrivePreviewProps> = ({
  url,
  width = 280,
  height = 200,
  className = "",
}) => {
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([]);
  const [currentThumbnailIndex, setCurrentThumbnailIndex] = useState(0);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [fileType, setFileType] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  // Extract file ID from Google Drive URL
  const extractFileId = (driveUrl: string): string | null => {
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9-_]+)/,
      /\/document\/d\/([a-zA-Z0-9-_]+)/,
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /\/presentation\/d\/([a-zA-Z0-9-_]+)/,
      /[?&]id=([a-zA-Z0-9-_]+)/,
    ];

    for (const pattern of patterns) {
      const match = driveUrl.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Determine file type from URL
  const determineFileType = (driveUrl: string): string => {
    if (driveUrl.includes("/document/")) return "doc";
    if (driveUrl.includes("/spreadsheets/")) return "sheet";
    if (driveUrl.includes("/presentation/")) return "slide";
    if (driveUrl.includes("/forms/")) return "form";
    return "file";
  };

  // Get file type label
  const getFileTypeLabel = (type: string): string => {
    switch (type) {
      case "doc":
        return "Google Docs";
      case "sheet":
        return "Google Sheets";
      case "slide":
        return "Google Slides";
      case "form":
        return "Google Forms";
      default:
        return "Google Drive";
    }
  };

  // Generate thumbnail URLs with different sizes
  const generateThumbnailUrls = (fileId: string): string[] => {
    const sizes = [
      "w400-h300",
      "w320-h240",
      "w256-h192",
      "w200-h150",
      "s400",
      "s320",
      "s256",
      "s200",
    ];

    return sizes.map(
      (size) => `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`
    );
  };

  useEffect(() => {
    const fileId = extractFileId(url);
    if (!fileId) return;

    const detectedFileType = determineFileType(url);
    setFileType(detectedFileType);
    setFileName(`${getFileTypeLabel(detectedFileType)} File`);

    const thumbnails = generateThumbnailUrls(fileId);
    setThumbnailUrls(thumbnails);
    setCurrentThumbnailIndex(0);
    setThumbnailError(false);
  }, [url]);

  // Handle thumbnail loading errors by trying the next URL
  const handleThumbnailError = () => {
    if (currentThumbnailIndex < thumbnailUrls.length - 1) {
      setCurrentThumbnailIndex((prev) => prev + 1);
    } else {
      setThumbnailError(true);
    }
  };

  // Open file in new tab
  const openFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, "_blank");
  };

  const fileId = extractFileId(url);
  if (!fileId) {
    return (
      <div
        className={`rounded-xl overflow-hidden shadow-md bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Invalid Google Drive URL</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl overflow-hidden shadow-md bg-white border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow ${className}`}
      style={{ width, height }}
      onClick={openFile}
    >
      <div className="relative w-full h-full flex flex-col">
        {/* Preview area */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          {thumbnailUrls.length > 0 && !thumbnailError ? (
            <div className="relative w-full h-full">
              <img
                src={thumbnailUrls[currentThumbnailIndex]}
                alt="Google Drive file preview"
                className="w-full h-full object-contain"
                onError={handleThumbnailError}
                onLoad={() =>
                  console.log(
                    `Google Drive thumbnail loaded: ${thumbnailUrls[currentThumbnailIndex]}`
                  )
                }
              />
              {/* Overlay with file type indicator */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {getFileTypeLabel(fileType).replace("Google ", "")}
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {getFileTypeLabel(fileType)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Click to view</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 bg-white border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 truncate flex-1">
              {fileName}
            </span>
            <button
              onClick={openFile}
              className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600 transition-colors"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
