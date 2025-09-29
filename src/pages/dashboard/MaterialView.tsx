import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Download01Icon, 
  Share08Icon, 
  Bookmark01Icon, 
  Maximize01Icon, 
  Minimize01Icon,
  Search01Icon
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useBookmarks } from "@/context/bookmark/BookmarkContextProvider";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";
import { Material } from "@/lib/types/material.types";

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

  // Mock material data - replace with actual API call
  useEffect(() => {
    const fetchMaterial = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockMaterial: Material = {
          id: id || "1",
          label: "LECTURE 3: MATRIX MULTIPLICATION",
          description: "Comprehensive lecture notes on matrix multiplication with examples and practice problems.",
          resourceAddress: "https://example.com/lecture3.pdf", // This would be the actual file URL
          type: "pdf",
          tags: ["MTH", "MTH202", "Mathematics", "Linear Algebra"],
          views: 245,
          downloads: 89,
          likes: 12,
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
          creator: {
            id: "1",
            firstName: "Tee",
            lastName: "Daniels",
            email: "tee.daniels@university.edu"
          },
          course: {
            id: "1",
            code: "MTH 202",
            name: "Linear Algebra",
            department: {
              id: "1",
              name: "Mathematics",
              faculty: {
                id: "1",
                name: "Computing"
              }
            }
          }
        };
        
        setMaterial(mockMaterial);
        setTotalPages(8); // This would come from the API
        
        // Mock related materials
        setRelatedMaterials([
          {
            id: "2",
            label: "CSC 204 Reading Materials",
            description: "This is the official final exam from 2023. Professor Adebayo released the solutions herself. Covers everything from Big O notation to graph traversal algorithms.",
            resourceAddress: "https://example.com/csc204.pdf",
            type: "pdf",
            tags: ["CSC", "CSC204"],
            views: 156,
            downloads: 67,
            likes: 8,
            createdAt: "2024-01-10T14:20:00Z",
            updatedAt: "2024-01-10T14:20:00Z",
            creator: {
              id: "2",
              firstName: "Sarah",
              lastName: "Johnson",
              email: "sarah.johnson@university.edu"
            }
          }
        ]);
      } catch (error) {
        console.error("Error fetching material:", error);
        toast.error("Failed to load material");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMaterial();
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownload = () => {
    if (material?.resourceAddress) {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = material.resourceAddress;
      link.download = material.label;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
    }
  };

  const handleShare = () => {
    const link = `${window.location.origin}/material/${id}`;
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
      toast.success(isBookmarked(material.id) ? "Removed from saved" : "Added to saved");
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Material not found</h2>
          <p className="text-gray-600 mb-4">The material you're looking for doesn't exist or has been removed.</p>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  const isBookmarkedMaterial = isBookmarked(material.id);

  return (
    <DashboardLayout>
      {/* Header with Breadcrumb */}
      <div className="bg-gradient-to-br from-[theme(colors.dashboard.gradientFrom)] to-[theme(colors.dashboard.gradientTo)]">
        <div className="px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 hover:text-brand transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Overview</span>
            </button>
            <span>•</span>
            <span>Recent Materials</span>
            <span>•</span>
            <span className="text-gray-900 font-medium">{material.label}</span>
          </div>

          {/* Document Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="bg-white/80 hover:bg-white"
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="text-sm text-gray-700 font-medium">
                  {currentPage} out of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="bg-white/80 hover:bg-white"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="bg-white/80 hover:bg-white"
              >
                < Minimize01Icon size={16} />
              </Button>
              <span className="text-sm text-gray-700 font-medium min-w-[3rem] text-center">
                {zoom}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="bg-white/80 hover:bg-white"
              >
                <Maximize01Icon size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 hover:bg-white"
              >
                <Search01Icon size={16} />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmark}
                className={`bg-white/80 hover:bg-white ${isBookmarkedMaterial ? "text-brand" : ""}`}
              >
                <Bookmark01Icon size={16} className={isBookmarkedMaterial ? "fill-current" : ""} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="bg-white/80 hover:bg-white"
              >
                <Share08Icon size={16} />
              </Button>
              <Button
                onClick={handleDownload}
                size="sm"
                className="bg-brand text-white hover:bg-brand/90"
              >
                <Download01Icon size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Main Content Area - Document Viewer */}
          <div className="flex-1 flex flex-col">
            {/* Document Viewer */}
            <div className="flex-1 bg-gray-100 rounded-t-3xl p-4">
              <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden">
                {material.resourceAddress ? (
                  <iframe
                    src={material.resourceAddress}
                    className="w-full h-full border-0"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                    title={material.label}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-4">📄</div>
                      <p>Document preview not available</p>
                      <Button onClick={handleDownload} className="mt-4">
                        Download to view
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Material Info & Related Materials */}
          <div className="w-80 bg-white rounded-t-3xl border border-gray-200 flex flex-col">
            {/* Material Information */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-lg font-semibold text-gray-900 mb-2">
                    {material.label}
                  </h1>
                  <p className="text-sm text-gray-600 mb-4">
                    {material.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBookmark}
                    className={isBookmarkedMaterial ? "text-brand" : ""}
                  >
                    <Bookmark01Icon size={16} className={isBookmarkedMaterial ? "fill-current" : ""} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share08Icon size={16} />
                  </Button>
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    className="bg-brand text-white hover:bg-brand/90"
                  >
                    <Download01Icon size={16} />
                  </Button>
                </div>
              </div>

              {/* Tags */}
              {material.tags && material.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {material.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Material Metadata */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{material.course?.department?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Faculty:</span>
                  <span className="font-medium">{material.course?.department?.faculty?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uploaded by:</span>
                  <span className="font-medium">
                    {material.creator?.firstName} {material.creator?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatRelativeTime(material.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">2.5MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pages:</span>
                  <span className="font-medium">{totalPages} pages</span>
                </div>
              </div>
            </div>

            {/* Related Materials */}
            <div className="flex-1 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Related Materials</h3>
              <div className="space-y-4">
                {relatedMaterials.map((relatedMaterial) => (
                  <Card key={relatedMaterial.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-900">
                        {relatedMaterial.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-600 mb-3">
                        {relatedMaterial.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleBookmark(relatedMaterial.id)}
                            className="p-1"
                          >
                            <Bookmark01Icon size={14} className={isBookmarked(relatedMaterial.id) ? "fill-current" : ""} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/material/${relatedMaterial.id}`)}
                            className="p-1"
                          >
                            <Share08Icon size={14} />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          className="bg-brand text-white hover:bg-brand/90"
                        >
                          <Download01Icon size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MaterialView;
