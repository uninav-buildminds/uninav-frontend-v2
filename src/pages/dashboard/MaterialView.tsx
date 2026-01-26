import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Download01Icon,
  Share08Icon,
  Bookmark01Icon,
  Alert02Icon,
  File01Icon,
  MaximizeScreenIcon,
  MinimizeScreenIcon,
  ArrowRight01Icon,
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useBookmarks } from "@/context/bookmark/BookmarkContextProvider";
import { useFullscreen } from "@/context/FullscreenContext";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";
import { Material, MaterialTypeEnum } from "@/lib/types/material.types";
import { getMaterialBySlug, trackMaterialDownload } from "@/api/materials.api";
import { getFoldersByMaterial } from "@/api/folder.api";
import { setRedirectPath, convertPublicToAuthPath } from "@/lib/authStorage";
import { allocateReadingPoints } from "@/api/points.api";
import { ResponseStatus } from "@/lib/types/response.types";
import { ResourceTypeEnum, RestrictionEnum } from "@/lib/types/material.types";
import ReactPdfViewer from "@/components/dashboard/viewers/ReactPdfViewer";
import GDriveFolderBrowser from "@/components/dashboard/viewers/GDriveFolderBrowser";
import GDriveFileViewer from "@/components/dashboard/viewers/GDriveFileViewer";
import YouTubeViewer from "@/components/dashboard/viewers/YouTubeViewer";
import PowerPointViewer from "@/components/dashboard/viewers/PowerPointViewer";
import { extractGDriveId } from "@/lib/utils/gdriveUtils";
import {
  downloadGDriveFile,
  downloadAllFilesFromFolder,
} from "@/api/gdrive.api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import MiniMaterialCard from "@/components/dashboard/MiniMaterialCard";

interface MaterialViewProps {
  isPublic?: boolean;
}

const MaterialView: React.FC<MaterialViewProps> = ({ isPublic = false }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" && window.innerWidth < 768 // Hide sidebar on mobile by default
  );
  const [iconsExpanded, setIconsExpanded] = useState(false);
  const [infoSheetOpen, setInfoSheetOpen] = useState(false);

  // Detect if device is actually a mobile device (not just small screen)
  const [isMobile] = useState(() => {
    if (typeof window === "undefined") return false;

    // Check for touch capability and mobile user agent
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isMobileUA =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    return isTouchDevice && isMobileUA;
  });

  // Force sidebar to stay collapsed on mobile
  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 768;
      if (isSmallScreen) {
        setSidebarCollapsed(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle keyboard shortcuts for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F11 is handled by browser, but we can handle F key as alternative
      if (e.key === "f" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only trigger if not typing in an input field
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          toggleFullscreen();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleFullscreen]);

  // Fetch material data from API
  useEffect(() => {
    const fetchMaterial = async () => {
      setLoading(true);
      try {
        if (!slug) {
          toast.error("Invalid material slug");
          return;
        }

        const response = await getMaterialBySlug(slug);

        if (response.status === ResponseStatus.SUCCESS) {
          const materialData = response.data;

          // Check if this material should redirect externally
          // Redirect if: material type is "other"
          const resourceAddress = materialData.resource?.resourceAddress;
          if (resourceAddress && materialData.type === MaterialTypeEnum.OTHER) {
            // Redirect to external URL
            window.open(resourceAddress, "_blank", "noopener,noreferrer"); // open in new tab
            navigate(-1); // go to previous path in history
            return;
          }

          setMaterial(materialData);

          // Extract total pages from metadata if available
          const metaData = materialData.metaData as
            | { pageCount?: number; fileCount?: number }
            | null
            | undefined;
          if (metaData?.pageCount) {
            setTotalPages(metaData.pageCount);
          } else if (metaData?.fileCount) {
            // For GDrive folders, fileCount represents total items
            setTotalPages(metaData.fileCount);
          } else {
            setTotalPages(8); // Fallback
          }

          // Fetch related materials from folders containing this material
          try {
            const foldersResponse = await getFoldersByMaterial(
              response.data.id
            );
            if (foldersResponse?.status === ResponseStatus.SUCCESS) {
              // Extract all materials from folders, excluding current material
              const allMaterials: Material[] = [];
              const seenIds = new Set<string>([response.data.id]); // Track to avoid duplicates

              foldersResponse.data.forEach((folder) => {
                folder.content?.forEach((content) => {
                  if (content.material && !seenIds.has(content.material.id)) {
                    allMaterials.push(content.material);
                    seenIds.add(content.material.id);
                  }
                });
              });

              // Limit to 10 related materials
              setRelatedMaterials(allMaterials.slice(0, 10));
            }
          } catch (error) {
            console.error("Error fetching related materials:", error);
            // Silently fail - related materials are optional
            setRelatedMaterials([]);
          }

          // Notify other components (e.g., sidebar Recents) to refresh
          // when a material is opened/viewed. This keeps normal navigation
          // snappy but ensures recents reflect latest server-side updates.
          window.dispatchEvent(new Event("recents:refresh"));
        } else {
          toast.error("Failed to load material");
          navigate(-1);
        }
      } catch (error: unknown) {
        console.error("Error fetching material:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load material";
        toast.error(errorMessage);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchMaterial();
    }
  }, [slug, navigate]);

  // Allocate reading points every 10 minutes (only for authenticated users)
  useEffect(() => {
    if (!material?.id || isPublic) return;

    const allocatePoints = async () => {
      try {
        await allocateReadingPoints();
      } catch (error) {
        console.error("Error allocating reading points:", error);
      }
    };

    // Allocate points immediately on mount
    allocatePoints();

    // Then every 10 minutes
    const interval = setInterval(allocatePoints, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [material?.id, isPublic]);

  // Handle page change from ReactPdfViewer
  const handlePageChange = useCallback((page: number, total: number) => {
    setCurrentPage(page);
    setTotalPages(total);
  }, []);

  const handleBack = () => {
    // If viewing a GDrive file within a folder, go back to folder
    if (viewingGDriveFile) {
      handleBackToFolder();
    } else {
      // Otherwise, go back in browser history
      navigate(-1);
    }
  };

  const handleDownload = async () => {
    if (!material?.resource?.resourceAddress) {
      toast.error("Download not available for this material");
      return;
    }

    // Check if material is read-only
    if (material.restriction === RestrictionEnum.READONLY) {
      toast.error("This material is read-only and cannot be downloaded");
      return;
    }

    // YouTube videos cannot be downloaded
    if (material.type === MaterialTypeEnum.YOUTUBE) {
      toast.error("YouTube videos cannot be downloaded directly");
      return;
    }

    try {
      // Track the download
      if (material.id) {
        await trackMaterialDownload(material.id);
      }

      // Handle Google Drive downloads (already works well)
      if (material.type === MaterialTypeEnum.GDRIVE) {
        const gdriveId = extractGDriveId(material.resource.resourceAddress);

        if (!gdriveId) {
          toast.error("Invalid Google Drive link");
          return;
        }

        // If it's a folder, download all files
        if (gdriveId.type === "folder") {
          toast.loading("Downloading files from folder...");
          const count = await downloadAllFilesFromFolder(gdriveId.id);
          toast.success(`Started downloading ${count} file(s) from folder`);
        } else {
          // Single file from GDrive
          toast.loading("Downloading file...");
          await downloadGDriveFile(gdriveId.id, material.label);
          toast.success("Download started!");
        }
      } else {
        // Handle regular uploaded files - fetch as blob to force download
        if (material.resource.resourceType === ResourceTypeEnum.UPLOAD) {
          toast.loading("Preparing download...");

          try {
            // Fetch the file as a blob
            const response = await fetch(material.resource.resourceAddress);

            if (!response.ok) {
              throw new Error("Failed to fetch file");
            }

            const blob = await response.blob();

            // Create a blob URL and trigger download
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = material.label;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the blob URL after a short delay
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);

            toast.dismiss();
            toast.success("Download started!");
          } catch (fetchError) {
            console.error("Fetch failed, trying direct download:", fetchError);
            toast.dismiss();

            // Fallback to direct link if fetch fails (e.g., CORS issues)
            const link = document.createElement("a");
            link.href = material.resource.resourceAddress;
            link.download = material.label;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Download started!");
          }
        } else {
          toast.error("Download not available for this material type");
        }
      }
    } catch (error: unknown) {
      console.error("Error downloading material:", error);
      toast.dismiss();
      const errorMessage =
        error instanceof Error ? error.message : "Failed to download material";
      toast.error(errorMessage);
    }
  };

  const handleShare = () => {
    if (!material?.slug) {
      toast.error("Cannot share material without slug");
      return;
    }
    // Use public link for sharing
    const link = `${window.location.origin}/view/material/${material.slug}`;
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
      <div className="h-full bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent"></div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="h-full bg-slate-50 flex items-center justify-center">
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
          <div className="pl-14 sm:pl-16 pr-3 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <button
                onClick={handleBackToFolder}
                className="hover:text-brand transition-colors font-medium"
              >
                Root
              </button>
              <ChevronRight size={12} className="text-gray-400" />
              <span className="text-gray-900 font-medium">File Preview</span>
            </div>
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

    // Handle YouTube videos
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

    // Handle regular PDF files
    if (
      material.type === MaterialTypeEnum.PDF &&
      material.resource?.resourceAddress
    ) {
      // Use Adobe PDF viewer on mobile for better compatibility
      // if (isMobile) {
      //   return (
      //     <AdobePDFViewer
      //       url={material.resource.resourceAddress}
      //       title={material.label}
      //       currentPage={currentPage}
      //       totalPages={totalPages}
      //       zoom={zoom}
      //       onPreviousPage={handlePreviousPage}
      //       onNextPage={handleNextPage}
      //       onZoomIn={handleZoomIn}
      //       onZoomOut={handleZoomOut}
      //       showControls={true}
      //     />
      //   );
      // }

      // Use native iframe viewer on desktop
      // return (
      //   <PDFViewer
      //     url={material.resource.resourceAddress}
      //     title={material.label}
      //     currentPage={currentPage}
      //     totalPages={totalPages}
      //     zoom={zoom}
      //     onPreviousPage={handlePreviousPage}
      //     onNextPage={handleNextPage}
      //     onZoomIn={handleZoomIn}
      //     onZoomOut={handleZoomOut}
      //     showControls={true}
      //   />
      // );

      // ReactPdfViewer - commented out for now, will use later
      return (
        <ReactPdfViewer
          url={material.resource.resourceAddress}
          title={material.label}
          showControls={true}
        />
      );
    }

    // Handle PowerPoint (ppt/pptx) using Office Online Viewer
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
          <HugeiconsIcon
            icon={File01Icon}
            strokeWidth={1.5}
            size={48}
            className="mx-auto mb-4 text-gray-400"
          />
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

  return (
    <>
      {/* Sign-in prompt banner for public views */}
      {isPublic && (
        <div className="bg-gradient-to-r from-brand/10 to-brand/5 border-b border-brand/20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center">
            <Link
              to="/auth/signin"
              onClick={() => {
                // Store current path for redirect after sign-in
                const currentPath = `/view/material/${slug}`;
                const authPath = convertPublicToAuthPath(currentPath);
                setRedirectPath(authPath);
              }}
              className="text-sm text-gray-700 hover:text-brand transition-colors text-center"
            >
              <span className="font-medium">Viewing as guest.</span>{" "}
              <span className="text-brand hover:underline">Sign in</span> to
              save materials, track progress, and more.
            </Link>
          </div>
        </div>
      )}

      {/* Main Content - Full Height with Floating Controls */}
      <div className="flex gap-2 sm:gap-3 h-full px-2 sm:px-3 py-2 relative">
        {/* Floating Back Button - Top Left */}
        <button
          onClick={handleBack}
          className={`fixed left-3 sm:left-4 z-50 p-2 sm:p-2.5 bg-white/90 backdrop-blur hover:bg-white border border-gray-200 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
            isPublic ? "top-[3.75rem] sm:top-4" : "top-3 sm:top-4"
          }`}
          aria-label="Go back"
        >
          <ArrowLeft size={18} className="text-gray-700" />
        </button>

        {/* Floating Action Buttons - Top Right */}
        <div
          className={`fixed z-50 flex items-center gap-1.5 sm:gap-2 transition-all duration-300 ${
            isPublic ? "top-[3.75rem] sm:top-4" : "top-3 sm:top-4"
          } ${
            isFullscreen
              ? "right-3 sm:right-4"
              : !sidebarCollapsed
              ? "right-3 sm:right-4 md:right-[calc(288px+0.5rem)]"
              : "right-3 sm:right-4"
          }`}
        >
          {/* Collapsible Icons Container - Slides out to the right when expanded */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 transition-all duration-500 ease-in-out ${
              iconsExpanded
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0 pointer-events-none"
            }`}
          >
            {/* Bookmark button - only show for authenticated users */}
            {!isPublic && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmark}
                className={`bg-white/90 backdrop-blur hover:bg-white border border-gray-200 h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full shadow-lg flex-shrink-0 ${
                  isBookmarkedMaterial ? "text-brand" : ""
                }`}
              >
                <HugeiconsIcon
                  icon={Bookmark01Icon}
                  strokeWidth={1.5}
                  size={15}
                  className={`sm:w-4 sm:h-4 ${
                    isBookmarkedMaterial ? "fill-current" : ""
                  }`}
                />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="bg-white/90 backdrop-blur hover:bg-white border border-gray-200 h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full shadow-lg flex-shrink-0"
            >
              <HugeiconsIcon
                icon={Share08Icon}
                strokeWidth={1.5}
                size={15}
                className="sm:w-4 sm:h-4"
              />
            </Button>
            {/* Show download button only if not read-only, not YouTube, and is either an uploaded file or GDrive material */}
            {material &&
              material.restriction !== RestrictionEnum.READONLY &&
              material.type !== MaterialTypeEnum.YOUTUBE &&
              (material.resource?.resourceType === ResourceTypeEnum.UPLOAD ||
                material.type === MaterialTypeEnum.GDRIVE) && (
                <Button
                  onClick={handleDownload}
                  size="sm"
                  className="bg-brand/90 backdrop-blur text-white hover:bg-brand border-2 border-white h-8 sm:h-9 px-3 sm:px-4 rounded-full shadow-lg flex-shrink-0"
                >
                  <HugeiconsIcon
                    icon={Download01Icon}
                    strokeWidth={1.5}
                    size={15}
                    className="sm:w-4 sm:h-4"
                  />
                </Button>
              )}
          </div>

          {/* Information Icon - Only visible on mobile/tablet (not desktop where sidebar exists) */}
          <button
            onClick={() => setInfoSheetOpen(true)}
            className="md:hidden flex items-center justify-center h-8 sm:h-9 w-8 sm:w-9 rounded-full bg-brand border border-white shadow-lg hover:bg-brand/90 transition-colors flex-shrink-0"
            aria-label="View material information"
            title="Material Information"
          >
            <HugeiconsIcon
              icon={InformationCircleIcon}
              strokeWidth={1.5}
              size={16}
              className="sm:w-4 sm:h-4 text-white"
            />
          </button>

          {/* Combined Maximize & Chevron Button - Rightmost */}
          <div className="flex items-center gap-0 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-lg overflow-hidden h-8 sm:h-9">
            {/* Maximize Icon Section */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-gray-50 transition-colors flex-shrink-0"
              title={
                isFullscreen
                  ? "Exit fullscreen (ESC)"
                  : "Enter fullscreen (F11)"
              }
            >
              {isFullscreen ? (
                <HugeiconsIcon
                  icon={MinimizeScreenIcon}
                  strokeWidth={1.5}
                  size={15}
                  className="sm:w-4 sm:h-4"
                />
              ) : (
                <HugeiconsIcon
                  icon={MaximizeScreenIcon}
                  strokeWidth={1.5}
                  size={15}
                  className="sm:w-4 sm:h-4"
                />
              )}
            </button>

            {/* Separator Line - Only visible when expanded */}
            <div
              className={`h-6 w-[1px] bg-gray-300 transition-all duration-500 ease-in-out ${
                iconsExpanded ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Chevron Section - Always visible, expands button width when icons are expanded */}
            <button
              onClick={() => setIconsExpanded(!iconsExpanded)}
              className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 p-0 hover:bg-gray-50 transition-colors flex-shrink-0"
              aria-label={iconsExpanded ? "Collapse icons" : "Expand icons"}
            >
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={1.5}
                size={15}
                className={`sm:w-4 sm:h-4 transition-transform duration-300 ${
                  iconsExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Document Viewer - Full Width/Height */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div
            className="relative flex-1 bg-gray-50 rounded-lg sm:rounded-xl shadow-sm h-full overflow-auto"
            style={{ isolation: "isolate" }}
          >
            {renderViewer()}
          </div>
        </div>

        {/* Right Sidebar - Material Info & Related Materials (Hidden on mobile and in fullscreen) */}
        {!isFullscreen && (
          <div
            className={`relative bg-white rounded-lg sm:rounded-xl border border-gray-200 flex-col transition-all duration-300 shadow-sm hidden md:flex ${
              sidebarCollapsed ? "w-0 border-0 overflow-hidden" : "w-64 sm:w-72"
            }`}
          >
            {/* Collapse handle - centered on left border */}
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 p-2 rounded-full bg-brand text-white shadow-md hover:opacity-90"
                aria-label="Collapse side panel"
              >
                <HugeiconsIcon
                  icon={ArrowRightDoubleIcon}
                  strokeWidth={1.5}
                  size={18}
                />
              </button>
            )}
            {/* Material Information */}
            <div className="p-3 border-b border-gray-200">
              <h1 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                {material.label}
              </h1>
              {material.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {material.description}
                </p>
              )}

              {/* Tags */}
              {material.tags && material.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {material.tags.slice(0, 3).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs py-0 px-1.5"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {material.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs py-0 px-1.5">
                      +{material.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Material Metadata */}
              <div className="space-y-1 text-xs">
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
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-600">Uploaded by:</span>
                  <button
                    onClick={() => {
                      if (material.creator?.id) {
                        navigate(`/dashboard/profile/${material.creator.id}`);
                      } else {
                        console.error("Creator ID is missing");
                      }
                    }}
                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage
                        src={material.creator?.profilePicture || undefined}
                        alt={`${material.creator?.firstName} ${material.creator?.lastName}`}
                      />
                      <AvatarFallback className="text-[10px] bg-brand/10 text-brand">
                        {material.creator?.firstName?.[0]}
                        {material.creator?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-brand hover:text-brand/80 transition-colors">
                      {material.creator?.firstName} {material.creator?.lastName}
                    </span>
                  </button>
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
            <div className="flex-1 p-3 overflow-y-auto">
              <h3 className="text-xs font-semibold text-gray-900 mb-3">
                Related Materials
              </h3>
              {relatedMaterials.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-3 sm:py-4 md:py-6 px-2">
                  No related materials found
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {relatedMaterials.map((relatedMaterial) => (
                    <MiniMaterialCard
                      key={relatedMaterial.id}
                      material={relatedMaterial}
                      onClick={() =>
                        navigate(`/dashboard/material/${relatedMaterial.slug}`)
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expand handle - when collapsed, fixed on right edge (md+) */}
        {!isFullscreen && sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="hidden md:flex fixed right-1 sm:right-2 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full bg-brand text-white shadow-md hover:opacity-90"
            aria-label="Expand side panel"
          >
            <HugeiconsIcon
              icon={ArrowLeftDoubleIcon}
              strokeWidth={1.5}
              size={18}
            />
          </button>
        )}
      </div>

      {/* Bottom Sheet Modal - Mobile Material Information */}
      <Sheet open={infoSheetOpen} onOpenChange={setInfoSheetOpen}>
        <SheetContent
          side="bottom"
          className="h-[85vh] overflow-y-auto rounded-t-2xl"
        >
          <SheetHeader>
            <SheetTitle>Material Information</SheetTitle>
          </SheetHeader>
          {material && (
            <div className="mt-6 space-y-6">
              {/* Material Information */}
              <div className="pb-4 border-b border-gray-200">
                <h1 className="text-base font-semibold text-gray-900 mb-2">
                  {material.label}
                </h1>
                {material.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {material.description}
                  </p>
                )}

                {/* Tags */}
                {material.tags && material.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {material.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs py-1 px-2"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Material Metadata */}
                <div className="space-y-2 text-sm">
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
                                  material.targetCourse.departments[0]
                                    .department.name
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
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-600">Uploaded by:</span>
                    <button
                      onClick={() => {
                        if (material.creator?.id) {
                          navigate(`/dashboard/profile/${material.creator.id}`);
                          setInfoSheetOpen(false);
                        } else {
                          console.error("Creator ID is missing");
                        }
                      }}
                      className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={material.creator?.profilePicture || undefined}
                          alt={`${material.creator?.firstName} ${material.creator?.lastName}`}
                        />
                        <AvatarFallback className="text-xs bg-brand/10 text-brand">
                          {material.creator?.firstName?.[0]}
                          {material.creator?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-brand hover:text-brand/80 transition-colors text-sm">
                        {material.creator?.firstName}{" "}
                        {material.creator?.lastName}
                      </span>
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {formatRelativeTime(material.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium uppercase">
                      {material.type}
                    </span>
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
              <div className="pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Related Materials
                </h3>
                {relatedMaterials.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No related materials found
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {relatedMaterials.map((relatedMaterial) => (
                      <MiniMaterialCard
                        key={relatedMaterial.id}
                        material={relatedMaterial}
                        onClick={() => {
                          navigate(
                            `/dashboard/material/${relatedMaterial.slug}`
                          );
                          setInfoSheetOpen(false);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MaterialView;
