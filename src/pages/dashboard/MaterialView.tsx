import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import {
  Download01Icon,
  Share08Icon,
  Bookmark01Icon,
  Maximize01Icon,
  Minimize01Icon,
  Search01Icon,
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useBookmarks } from "@/context/bookmark/BookmarkContextProvider";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";
import { Material, MaterialTypeEnum } from "@/lib/types/material.types";
import { getMaterialById } from "@/api/materials.api";
import { ResponseStatus } from "@/lib/types/response.types";
import PDFViewer from "@/components/dashboard/viewers/PDFViewer";
import GDriveFolderBrowser from "@/components/dashboard/viewers/GDriveFolderBrowser";
import GDriveFileViewer from "@/components/dashboard/viewers/GDriveFileViewer";
import { extractGDriveId, isGDriveFolder } from "@/lib/utils/gdriveUtils";

const MaterialView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  // Mock data - replace with actual API call
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(8);
  const [zoom, setZoom] = useState(100);
  const [relatedMaterials, setRelatedMaterials] = useState<Material[]>([]);
  const [viewingGDriveFile, setViewingGDriveFile] = useState<{
    fileId: string;
    mimeType: string;
  } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fetch material data from API
  useEffect(() => {
    const fetchMaterial = async () => {
      setLoading(true);
      try {
        if (!id) {
          toast.error("Invalid material ID");
          return;
        }

        const response = await getMaterialById(id);

        if (response.status === ResponseStatus.SUCCESS) {
          setMaterial(response.data);
          setTotalPages(8); // TODO: Extract from PDF metadata if available

          // TODO: Fetch related materials based on tags or course
          setRelatedMaterials([]);
        } else {
          toast.error("Failed to load material");
          navigate(-1);
        }
      } catch (error: any) {
        console.error("Error fetching material:", error);
        toast.error(error.message || "Failed to load material");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMaterial();
    }
  }, [id, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownload = () => {
    if (material?.resource?.resourceAddress) {
      // Create a temporary link to download the file
      const link = document.createElement("a");
      link.href = material.resource.resourceAddress;
      link.download = material.label;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
    } else {
      toast.error("Download not available for this material");
    }
  };

  const handleShare = () => {
    const link = `${window.location.origin}/dashboard/material/${id}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  const handleBookmark = () => {
    if (material) {
      toggleBookmark(material.id);
      toast.success(
        isBookmarked(material.id) ? "Removed from saved" : "Added to saved"
      );
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleViewGDriveFile = (fileId: string, mimeType: string) => {
    setViewingGDriveFile({ fileId, mimeType });
  };

  const handleBackToFolder = () => {
    setViewingGDriveFile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent"></div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Material not found
          </h2>
          <p className="text-gray-600 mb-4">
            The material you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  const isBookmarkedMaterial = isBookmarked(material.id);

  // Determine which viewer to render
  const renderViewer = () => {
    // If viewing a specific file from GDrive folder
    if (viewingGDriveFile) {
      return (
        <div className="h-full flex flex-col">
          <div className="p-3 bg-white border-b border-gray-200 rounded-t-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToFolder}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back to Folder
            </Button>
          </div>
          <div className="flex-1">
            <GDriveFileViewer
              fileId={viewingGDriveFile.fileId}
              mimeType={viewingGDriveFile.mimeType}
              zoom={zoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
            />
          </div>
        </div>
      );
    }

    // Handle Google Drive materials
    if (
      material.type === MaterialTypeEnum.GDRIVE &&
      material.resource?.resourceAddress
    ) {
      const gdriveId = extractGDriveId(material.resource.resourceAddress);

      if (!gdriveId) {
        return (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <p>Invalid Google Drive link</p>
              <p className="text-sm text-gray-600 mt-2">
                The provided link could not be processed.
              </p>
            </div>
          </div>
        );
      }

      // Check if it's a folder
      if (gdriveId.type === "folder") {
        return (
          <GDriveFolderBrowser
            folderId={gdriveId.id}
            folderName={material.label}
            onViewFile={handleViewGDriveFile}
          />
        );
      }

      // Single file from GDrive
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
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      );
    }

    // Handle regular PDF files
    if (
      material.type === MaterialTypeEnum.PDF &&
      material.resource?.resourceAddress
    ) {
      return (
        <PDFViewer
          url={material.resource.resourceAddress}
          title={material.label}
          currentPage={currentPage}
          totalPages={totalPages}
          zoom={zoom}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          showControls={true}
        />
      );
    }

    // Handle other file types (images, videos, etc.)
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

    // Fallback when no resource address
    return (
      <div className="h-full flex items-center justify-center text-gray-500 bg-white rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">📄</div>
          <p>Document preview not available</p>
          <Button
            onClick={handleDownload}
            className="mt-4"
            disabled={!material.resource?.resourceAddress}
          >
            Download to view
          </Button>
        </div>
      </div>
    );
  };

  // Show controls only for non-GDrive PDFs (GDrive has its own built-in controls)
  const showPDFControls =
    material.type === MaterialTypeEnum.PDF && !viewingGDriveFile;
  const showZoomControls = material.type === MaterialTypeEnum.PDF;

  return (
    <DashboardShell>
      {/* Header with Breadcrumb - Compact */}
      <div className="bg-gradient-to-br from-[theme(colors.dashboard.gradientFrom)] to-[theme(colors.dashboard.gradientTo)]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-brand transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Overview</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmark}
                className={`bg-white/80 hover:bg-white h-7 w-7 p-0 ${
                  isBookmarkedMaterial ? "text-brand" : ""
                }`}
              >
                <Bookmark01Icon
                  size={14}
                  className={isBookmarkedMaterial ? "fill-current" : ""}
                />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="bg-white/80 hover:bg-white h-7 w-7 p-0"
              >
                <Share08Icon size={14} />
              </Button>
              <Button
                onClick={handleDownload}
                size="sm"
                className="bg-brand text-white hover:bg-brand/90 h-7 px-3"
              >
                <Download01Icon size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex gap-6 h-[calc(100vh-180px)]">
          {/* Main Content Area - Document Viewer */}
          <div className="flex-1 flex flex-col">
            {/* Document Viewer */}
            <div className="flex-1 bg-gray-100 rounded-3xl overflow-hidden">
              {renderViewer()}
            </div>
          </div>

          {/* Right Sidebar - Material Info & Related Materials */}
          <div
            className={`relative bg-white rounded-t-3xl border border-gray-200 flex flex-col transition-all duration-300 ${
              sidebarCollapsed ? "w-0 border-0 overflow-hidden" : "w-72"
            }`}
          >
            {/* Collapse Toggle Button - At Junction */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`absolute ${
                sidebarCollapsed ? "-left-8" : "-left-8"
              } top-1/2 -translate-y-1/2 z-20 p-2 bg-brand/90 hover:bg-brand border-2 border-white rounded-full shadow-lg transition-all duration-300`}
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              <ChevronsRight
                size={18}
                className={`text-white transition-transform duration-300 ${
                  sidebarCollapsed ? "" : "rotate-180"
                }`}
              />
            </button>

            {/* Material Information */}
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-base font-semibold text-gray-900 mb-1.5">
                {material.label}
              </h1>
              {material.description && (
                <p className="text-xs text-gray-600 mb-3">
                  {material.description}
                </p>
              )}

              {/* Tags */}
              {material.tags && material.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {material.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs py-0 px-2"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Material Metadata */}
              <div className="space-y-1.5 text-xs">
                {material.targetCourse && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Course:</span>
                      <span className="font-medium">
                        {material.targetCourse.courseCode}
                      </span>
                    </div>
                    {material.targetCourse.departments &&
                      material.targetCourse.departments.length > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Department:</span>
                            <span className="font-medium">
                              {
                                material.targetCourse.departments[0].department
                                  .name
                              }
                            </span>
                          </div>
                          {material.targetCourse.departments[0].department
                            .faculty && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Faculty:</span>
                              <span className="font-medium">
                                {
                                  material.targetCourse.departments[0]
                                    .department.faculty.name
                                }
                              </span>
                            </div>
                          )}
                        </>
                      )}
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Uploaded by:</span>
                  <span className="font-medium">
                    {material.creator?.firstName} {material.creator?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {formatRelativeTime(material.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium uppercase">{material.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Views:</span>
                  <span className="font-medium">{material.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Downloads:</span>
                  <span className="font-medium">{material.downloads}</span>
                </div>
              </div>
            </div>

            {/* Related Materials */}
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Related Materials
              </h3>
              {relatedMaterials.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-8">
                  No related materials found
                </p>
              ) : (
                <div className="space-y-3">
                  {relatedMaterials.map((relatedMaterial) => (
                    <Card
                      key={relatedMaterial.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() =>
                        navigate(`/dashboard/material/${relatedMaterial.id}`)
                      }
                    >
                      <CardHeader className="pb-2 px-3 pt-3">
                        <CardTitle className="text-xs font-medium text-gray-900">
                          {relatedMaterial.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 px-3 pb-3">
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {relatedMaterial.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default MaterialView;
