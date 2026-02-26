import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Alert02Icon, File01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Material, MaterialTypeEnum } from "@/lib/types/material.types";
import { extractGDriveId } from "@/lib/utils/gdriveUtils";
import ReactPdfViewer from "@/components/dashboard/viewers/ReactPdfViewer";
import GDriveFolderBrowser from "@/components/dashboard/viewers/GDriveFolderBrowser";
import GDriveFileViewer from "@/components/dashboard/viewers/GDriveFileViewer";
import YouTubeViewer from "@/components/dashboard/viewers/YouTubeViewer";
import PowerPointViewer from "@/components/dashboard/viewers/PowerPointViewer";

export interface ViewingGDriveFile {
  fileId: string;
  mimeType: string;
}

interface MaterialViewerAreaProps {
  material: Material;
  viewingGDriveFile: ViewingGDriveFile | null;
  zoom: number;
  onBackToFolder: () => void;
  onViewGDriveFile: (fileId: string, mimeType: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onDownload: () => void;
}

const MaterialViewerArea: React.FC<MaterialViewerAreaProps> = ({
  material,
  viewingGDriveFile,
  zoom,
  onBackToFolder,
  onViewGDriveFile,
  onZoomIn,
  onZoomOut,
  onDownload,
}) => {
  if (viewingGDriveFile) {
    return (
      <div className="h-full flex flex-col">
        <div className="pl-14 sm:pl-16 pr-3 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <button
              onClick={onBackToFolder}
              className="hover:text-brand transition-colors font-medium"
            >
              Root
            </button>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={1.5}
              size={12}
              className="text-gray-400"
            />
            <span className="text-gray-900 font-medium">File Preview</span>
          </div>
        </div>
        <div className="flex-1">
          <GDriveFileViewer
            fileId={viewingGDriveFile.fileId}
            mimeType={viewingGDriveFile.mimeType}
            zoom={zoom}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
          />
        </div>
      </div>
    );
  }

  // Use same GDrive viewers for GDRIVE and for GUIDE when resource is a GDrive URL
  if (
    (material.type === MaterialTypeEnum.GDRIVE ||
      material.type === MaterialTypeEnum.GUIDE) &&
    material.resource?.resourceAddress
  ) {
    const gdriveId = extractGDriveId(material.resource.resourceAddress);

    if (gdriveId) {
      if (gdriveId.type === "folder") {
        return (
          <GDriveFolderBrowser
            folderId={gdriveId.id}
            folderName={material.label}
            onViewFile={onViewGDriveFile}
          />
        );
      }

      return (
        <GDriveFileViewer
          fileId={gdriveId.id}
          mimeType={
            gdriveId.type === "doc"
              ? "application/vnd.google-apps.document"
              : gdriveId.type === "sheet"
                ? "application/vnd.google-apps.spreadsheet"
                : gdriveId.type === "presentation"
                  ? "application/vnd.google-apps.presentation"
                  : undefined
          }
          zoom={zoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
      );
    }

    // Invalid GDrive URL only for GDRIVE type; GUIDE with non-GDrive URL falls through to iframe
    if (material.type === MaterialTypeEnum.GDRIVE) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <HugeiconsIcon
              icon={Alert02Icon}
              strokeWidth={1.5}
              size={48}
              className="mx-auto mb-4 text-yellow-400"
            />
            <p>Invalid Google Drive link</p>
            <p className="text-sm text-gray-600 mt-2">
              The provided link could not be processed.
            </p>
          </div>
        </div>
      );
    }
  }

  if (
    material.type === MaterialTypeEnum.YOUTUBE &&
    material.resource?.resourceAddress
  ) {
    return (
      <YouTubeViewer
        url={material.resource.resourceAddress}
        title={material.label}
      />
    );
  }

  if (
    material.type === MaterialTypeEnum.PDF &&
    material.resource?.resourceAddress
  ) {
    return (
      <ReactPdfViewer
        url={material.resource.resourceAddress}
        title={material.label}
        showControls={true}
      />
    );
  }

  if (
    material.type === MaterialTypeEnum.PPT &&
    material.resource?.resourceAddress
  ) {
    return (
      <PowerPointViewer
        url={material.resource.resourceAddress}
        title={material.label}
      />
    );
  }

  if (material.resource?.resourceAddress) {
    return (
      <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden">
        <iframe
          src={material.resource.resourceAddress}
          className="w-full h-full border-0"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top left",
          }}
          title={material.label}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center text-gray-500 bg-white rounded-lg">
      <div className="text-center">
        <HugeiconsIcon
          icon={File01Icon}
          strokeWidth={1.5}
          size={48}
          className="mx-auto mb-4 text-gray-400"
        />
        <p>Document preview not available</p>
        <Button
          onClick={onDownload}
          className="mt-4"
          disabled={!material.resource?.resourceAddress}
        >
          Download to view
        </Button>
      </div>
    </div>
  );
};

export default MaterialViewerArea;
