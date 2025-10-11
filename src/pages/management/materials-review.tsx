import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUrlState } from "@/hooks/useUrlState";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import SearchBar from "@/components/management/SearchBar";
import ReviewTabs from "@/components/management/ReviewTabs";
import ReviewPagination from "@/components/management/ReviewPagination";
import ReviewActionDialog from "@/components/management/ReviewActionDialog";
import DeleteConfirmationDialog from "@/components/management/DeleteConfirmationDialog";
import MaterialReviewModal from "@/components/management/MaterialReviewModal";
import {
  getMaterialReviews,
  reviewMaterial,
  deleteMaterialAsAdmin,
  getMaterialReviewCounts,
  Material,
} from "@/api/review.api";
import {
  ApprovalStatusEnum,
  ResponseStatus,
  UserRole,
} from "@/lib/types/response.types";
import {
  BookOpen,
  Loader2,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { ReviewActionDTO } from "@/lib/types/review.types";

const MaterialsReviewContent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Use URL state hook
  const {
    activeTab,
    currentPage,
    searchQuery,
    handleTabChange,
    handlePageChange,
    handleSearchChange,
    setSearchQuery,
  } = useUrlState({ defaultTab: "ALL" });

  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [reviewAction, setReviewAction] = useState<ApprovalStatusEnum | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0,
  });

  // Access Control
  useEffect(() => {
    if (
      user &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.MODERATOR
    ) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchMaterials();
  }, [activeTab, currentPage]);

  useEffect(() => {
    const fetchCounts = async () => {
      const response = await getMaterialReviewCounts();
      if (response && response.status === ResponseStatus.SUCCESS) {
        const data = response.data;
        setCounts({
          ...data,
          all: data.pending + data.approved + data.rejected,
        });
      }
    };
    fetchCounts();
  }, []);

  const fetchMaterials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMaterialReviews({
        status: activeTab === "ALL" ? undefined : activeTab,
        page: currentPage,
        limit: 12,
        query: searchQuery || undefined,
      });
      if (response && response.status === ResponseStatus.SUCCESS) {
        setMaterials(response.data.items);
        const total = response.data?.pagination?.totalPages;
        setTotalPages(typeof total === "number" && total > 0 ? total : 1);
      } else {
        setError("Failed to load materials");
      }
    } catch (err) {
      setError("An error occurred while loading materials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchChange(searchQuery);
    fetchMaterials(); // Trigger the actual search
  };

  const getEmptyStateMessage = (activeTab: string) => {
    if (activeTab === "ALL") return "There are no materials found.";
    if (activeTab === ApprovalStatusEnum.PENDING)
      return "There are no materials waiting for review.";
    if (activeTab === ApprovalStatusEnum.APPROVED)
      return "There are no approved materials.";
    return "There are no rejected materials.";
  };

  const handleReviewAction = (
    material: Material,
    action: ApprovalStatusEnum
  ) => {
    setSelectedMaterial(material);
    setReviewAction(action);
  };

  // Approve immediately without requiring a comment
  const approveMaterialNow = async (material: Material) => {
    try {
      const payload: ReviewActionDTO = {
        action: ApprovalStatusEnum.APPROVED,
        comment: undefined,
      };
      const response = await reviewMaterial(material.id, payload);
      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Success",
          description: "Material approved",
        });
        setCounts((prev) => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          approved: prev.approved + 1,
        }));
        fetchMaterials();
      } else {
        toast({ title: "Error", description: "Action failed" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred" });
    }
  };

  const handleDeleteAction = (material: Material) => {
    setSelectedMaterial(material);
    setIsDeleteDialogOpen(true);
  };

  const handleMaterialClick = (material: Material) => {
    setSelectedMaterial(material);
    setIsReviewModalOpen(true);
  };

  const confirmReviewAction = async (
    action: ApprovalStatusEnum,
    comment: string
  ) => {
    if (!selectedMaterial) return;
    try {
      const payload = {
        action,
        comment: comment.trim() || undefined,
      };
      const response = await reviewMaterial(selectedMaterial.id, payload);
      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Success",
          description: `Material ${
            action === ApprovalStatusEnum.APPROVED ? "approved" : "rejected"
          }`,
        });
        setCounts((prev) => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          [action === ApprovalStatusEnum.APPROVED ? "approved" : "rejected"]:
            prev[
              action === ApprovalStatusEnum.APPROVED ? "approved" : "rejected"
            ] + 1,
        }));
        fetchMaterials();
      } else {
        toast({ title: "Error", description: "Action failed" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred" });
    }
  };

  const confirmDelete = async () => {
    if (!selectedMaterial || user?.role !== UserRole.ADMIN) return;
    try {
      const response = await deleteMaterialAsAdmin(selectedMaterial.id);
      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Deleted",
          description: "Material deleted successfully",
        });
        setCounts((prev) => ({
          ...prev,
          [activeTab.toLowerCase()]: Math.max(
            0,
            (prev as any)[activeTab.toLowerCase()] - 1
          ),
        }));
        fetchMaterials();
      } else {
        toast({ title: "Error", description: "Failed to delete material" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred" });
    }
  };

  if (
    !user ||
    (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR)
  )
    return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold">Materials Review</h1>
      </div>

      <SearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSubmit={handleSearch}
        placeholder="Search materials..."
      />

      <ReviewTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pendingCount={counts.pending}
        approvedCount={counts.approved}
        rejectedCount={counts.rejected}
        allCount={counts.all}
      >
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
          ) : materials.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No materials found</h3>
              <p className="text-gray-600">{getEmptyStateMessage(activeTab)}</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                  onClick={() => handleMaterialClick(material)}
                >
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {material.label}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0">
                            <AvatarImage
                              src={
                                material.creator?.profilePicture || undefined
                              }
                              alt={`${material.creator?.firstName} ${material.creator?.lastName}`}
                            />
                            <AvatarFallback className="text-xs bg-brand/10 text-brand">
                              {material.creator?.firstName?.[0]}
                              {material.creator?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            by {material.creator?.firstName}{" "}
                            {material.creator?.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className="bg-blue-600 text-white capitalize text-xs flex-shrink-0">
                          {(material.type as any)
                            ?.toString()
                            .replace(/_/g, " ")}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs flex-shrink-0 ${
                            material.reviewStatus ===
                            ApprovalStatusEnum.APPROVED
                              ? "bg-green-100 text-green-700 border-green-200"
                              : material.reviewStatus ===
                                ApprovalStatusEnum.REJECTED
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          {material.reviewStatus}
                        </Badge>
                      </div>
                    </div>
                    {material.description && (
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3">
                        {material.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-500">
                        <span className="hidden xs:inline">
                          Views: {material.views}
                        </span>
                        <span className="xs:hidden">{material.views}</span>
                        <span className="hidden sm:inline">
                          Downloads: {material.downloads}
                        </span>
                        <span className="sm:hidden">{material.downloads}</span>
                        <span className="hidden sm:inline">
                          Likes: {material.likes}
                        </span>
                        <span className="sm:hidden">{material.likes}</span>
                      </div>
                      {material.targetCourse && (
                        <Badge
                          variant="outline"
                          className="text-xs flex-shrink-0"
                        >
                          {material.targetCourse.courseCode}
                        </Badge>
                      )}
                    </div>

                    {Array.isArray(material.tags) &&
                      material.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {material.tags.slice(0, 1).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs truncate max-w-[80px]"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {material.tags.length > 1 && (
                            <Badge variant="outline" className="text-xs">
                              +{material.tags.length - 1} more
                            </Badge>
                          )}
                        </div>
                      )}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            approveMaterialNow(material);
                          }}
                        >
                          <CheckCircle size={12} className="mr-1" />
                          <span className="hidden sm:inline">Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs px-2 py-1 h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReviewAction(
                              material,
                              ApprovalStatusEnum.REJECTED
                            );
                          }}
                        >
                          <XCircle size={12} className="mr-1" />
                          <span className="hidden sm:inline">Reject</span>
                        </Button>
                      </div>
                      {user.role === UserRole.ADMIN && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs p-1 h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAction(material);
                          }}
                          title="Delete material"
                        >
                          <Trash2 size={12} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <ReviewPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </ReviewTabs>

      {selectedMaterial && reviewAction && (
        <ReviewActionDialog
          isOpen={!!reviewAction}
          onClose={() => setReviewAction(null)}
          onConfirm={confirmReviewAction}
          action={reviewAction}
          contentType="Material"
        />
      )}

      {selectedMaterial && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          contentType="Material"
          itemName={selectedMaterial.label}
        />
      )}

      <MaterialReviewModal
        material={selectedMaterial}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onUpdate={() => {
          fetchMaterials();
          // Refresh counts as well
          const fetchCounts = async () => {
            const response = await getMaterialReviewCounts();
            if (response && response.status === ResponseStatus.SUCCESS) {
              setCounts(response.data);
            }
          };
          fetchCounts();
        }}
      />
    </div>
  );
};

const MaterialsReviewPage: React.FC = () => {
  return <MaterialsReviewContent />;
};

export default MaterialsReviewPage;
