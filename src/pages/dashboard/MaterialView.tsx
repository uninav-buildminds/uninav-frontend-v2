import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeftDoubleIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/context/bookmark/BookmarkContextProvider";
import { useFullscreen } from "@/context/FullscreenContext";
import { toast } from "sonner";
import { Material, MaterialTypeEnum } from "@/lib/types/material.types";
import { getMaterialBySlug, trackMaterialDownload } from "@/api/materials.api";
import { getFoldersByMaterial } from "@/api/folder.api";
import { setRedirectPath, convertPublicToAuthPath } from "@/lib/authStorage";
import { allocateReadingPoints } from "@/api/points.api";
import { ResponseStatus } from "@/lib/types/response.types";
import { ResourceTypeEnum, RestrictionEnum } from "@/lib/types/material.types";
import { extractGDriveId } from "@/lib/utils/gdriveUtils";
import {
  downloadGDriveFile,
  downloadAllFilesFromFolder,
} from "@/api/gdrive.api";
import {
  MaterialViewToolbar,
  MaterialViewerArea,
  MaterialSidebar,
  MaterialInfoSheet,
  type ViewingGDriveFile,
} from "./material-view";
import { FlagReportModal } from "@/components/modals/material";

interface MaterialViewProps {
  isPublic?: boolean;
}

const MaterialView: React.FC<MaterialViewProps> = ({ isPublic = false }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(8);
  const [zoom, setZoom] = useState(100);
  const [relatedMaterials, setRelatedMaterials] = useState<Material[]>([]);
  const [viewingGDriveFile, setViewingGDriveFile] =
    useState<ViewingGDriveFile | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );
  const [iconsExpanded, setIconsExpanded] = useState(false);
  const [infoSheetOpen, setInfoSheetOpen] = useState(false);
  const [flagReportOpen, setFlagReportOpen] = useState(false);

  const [isMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isMobileUA =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    return isTouchDevice && isMobileUA;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarCollapsed(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "f" && !e.ctrlKey && !e.metaKey && !e.altKey) {
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
          const resourceAddress = materialData.resource?.resourceAddress;
          if (
            resourceAddress &&
            materialData.type === MaterialTypeEnum.OTHER
          ) {
            window.open(resourceAddress, "_blank", "noopener,noreferrer");
            navigate(-1);
            return;
          }

          setMaterial(materialData);

          const metaData = materialData.metaData as
            | { pageCount?: number; fileCount?: number }
            | null
            | undefined;
          if (metaData?.pageCount) {
            setTotalPages(metaData.pageCount);
          } else if (metaData?.fileCount) {
            setTotalPages(metaData.fileCount);
          } else {
            setTotalPages(8);
          }

          try {
            const foldersResponse = await getFoldersByMaterial(
              response.data.id
            );
            if (foldersResponse?.status === ResponseStatus.SUCCESS) {
              const allMaterials: Material[] = [];
              const seenIds = new Set<string>([response.data.id]);
              foldersResponse.data.forEach((folder) => {
                folder.content?.forEach((content) => {
                  if (
                    content.material &&
                    !seenIds.has(content.material.id)
                  ) {
                    allMaterials.push(content.material);
                    seenIds.add(content.material.id);
                  }
                });
              });
              setRelatedMaterials(allMaterials.slice(0, 10));
            }
          } catch {
            setRelatedMaterials([]);
          }

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

    if (slug) fetchMaterial();
  }, [slug, navigate]);

  useEffect(() => {
    if (!material?.id || isPublic) return;
    const allocatePoints = async () => {
      try {
        await allocateReadingPoints();
      } catch (error) {
        console.error("Error allocating reading points:", error);
      }
    };
    allocatePoints();
    const interval = setInterval(allocatePoints, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [material?.id, isPublic]);

  const handleBack = () => {
    if (viewingGDriveFile) {
      setViewingGDriveFile(null);
    } else {
      navigate(-1);
    }
  };

  const handleDownload = async () => {
    if (!material?.resource?.resourceAddress) {
      toast.error("Download not available for this material");
      return;
    }
    if (material.restriction === RestrictionEnum.READONLY) {
      toast.error("This material is read-only and cannot be downloaded");
      return;
    }
    if (material.type === MaterialTypeEnum.YOUTUBE) {
      toast.error("YouTube videos cannot be downloaded directly");
      return;
    }

    try {
      if (material.id) {
        await trackMaterialDownload(material.id);
      }

      if (material.type === MaterialTypeEnum.GDRIVE) {
        const gdriveId = extractGDriveId(material.resource.resourceAddress);
        if (!gdriveId) {
          toast.error("Invalid Google Drive link");
          return;
        }
        if (gdriveId.type === "folder") {
          toast.loading("Downloading files from folder...");
          const count = await downloadAllFilesFromFolder(gdriveId.id);
          toast.success(`Started downloading ${count} file(s) from folder`);
        } else {
          toast.loading("Downloading file...");
          await downloadGDriveFile(gdriveId.id, material.label);
          toast.success("Download started!");
        }
      } else {
        if (material.resource.resourceType === ResourceTypeEnum.UPLOAD) {
          toast.loading("Preparing download...");
          try {
            const response = await fetch(material.resource.resourceAddress);
            if (!response.ok) throw new Error("Failed to fetch file");
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = material.label;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
            toast.dismiss();
            toast.success("Download started!");
          } catch (fetchError) {
            console.error("Fetch failed, trying direct download:", fetchError);
            toast.dismiss();
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
        error instanceof Error
          ? error.message
          : "Failed to download material";
      toast.error(errorMessage);
    }
  };

  const handleShare = () => {
    if (!material?.slug) {
      toast.error("Cannot share material without slug");
      return;
    }
    const link = `${window.location.origin}/view/material/${material.slug}`;
    navigator.clipboard
      .writeText(link)
      .then(() => toast.success("Link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const handleBookmark = () => {
    if (material) {
      toggleBookmark(material.id);
      toast.success(
        isBookmarked(material.id) ? "Removed from saved" : "Added to saved"
      );
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleViewGDriveFile = (fileId: string, mimeType: string) => {
    setViewingGDriveFile({ fileId, mimeType });
  };
  const handleBackToFolder = () => setViewingGDriveFile(null);

  const handleOpenFlagModal = () => {
    setInfoSheetOpen(false);
    setFlagReportOpen(true);
  };

  const handleLike = () => toast.success("Thanks for your feedback!");
  const handleDislike = () => toast.success("Thanks for your feedback!");

  const topOffsetClass = isPublic
    ? "top-[3.75rem] sm:top-4"
    : "top-3 sm:top-4";

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

  return (
    <>
      {isPublic && (
        <div className="bg-gradient-to-r from-brand/10 to-brand/5 border-b border-brand/20 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center">
            <Link
              to="/auth/signin"
              onClick={() => {
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

      <div className="flex gap-2 sm:gap-3 h-full px-2 sm:px-3 py-2 relative">
        <MaterialViewToolbar
          onBack={handleBack}
          onBookmark={handleBookmark}
          onShare={handleShare}
          onDownload={handleDownload}
          onToggleFullscreen={toggleFullscreen}
          onOpenInfoSheet={() => setInfoSheetOpen(true)}
          isPublic={isPublic}
          isBookmarked={isBookmarked(material.id)}
          isFullscreen={isFullscreen}
          sidebarCollapsed={sidebarCollapsed}
          iconsExpanded={iconsExpanded}
          onIconsExpandedChange={setIconsExpanded}
          material={material}
          topOffsetClass={topOffsetClass}
        />

        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div
            className="relative flex-1 bg-gray-50 rounded-lg sm:rounded-xl shadow-sm h-full overflow-auto"
            style={{ isolation: "isolate" }}
          >
            <MaterialViewerArea
              material={material}
              viewingGDriveFile={viewingGDriveFile}
              zoom={zoom}
              onBackToFolder={handleBackToFolder}
              onViewGDriveFile={handleViewGDriveFile}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onDownload={handleDownload}
            />
          </div>
        </div>

        {!isFullscreen && (
          <MaterialSidebar
            material={material}
            relatedMaterials={relatedMaterials}
            sidebarCollapsed={sidebarCollapsed}
            onCollapse={() => setSidebarCollapsed(true)}
            onFlag={handleOpenFlagModal}
            onLike={handleLike}
            onDislike={handleDislike}
          />
        )}

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

      <MaterialInfoSheet
        material={material}
        relatedMaterials={relatedMaterials}
        open={infoSheetOpen}
        onOpenChange={setInfoSheetOpen}
        onFlag={handleOpenFlagModal}
        onLike={handleLike}
        onDislike={handleDislike}
      />

      {material && (
        <FlagReportModal
          isOpen={flagReportOpen}
          onClose={() => setFlagReportOpen(false)}
          materialId={material.id}
          materialSlug={material.slug}
          materialTitle={material.label}
          isMobile={isMobile}
        />
      )}
    </>
  );
};

export default MaterialView;
