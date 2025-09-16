import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ReviewTabs from "@/components/management/ReviewTabs";
import ReviewActionDialog from "@/components/management/ReviewActionDialog";
import DeleteConfirmationDialog from "@/components/management/DeleteConfirmationDialog";
import {
  getMaterialReviews,
  reviewMaterial,
  deleteMaterialAsAdmin,
  getMaterialReviewCounts,
  ReviewActionDTO,
  Material,
} from "@/api/review.api";
import {
  ApprovalStatusEnum,
  ResponseStatus,
  UserRole,
} from "@/lib/types/response.types";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Eye,
} from "lucide-react";

const MaterialsReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(
    ApprovalStatusEnum.PENDING
  );
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [reviewAction, setReviewAction] = useState<ApprovalStatusEnum | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
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
        setCounts(response.data);
      }
    };
    fetchCounts();
  }, []);

  const fetchMaterials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMaterialReviews({
        status: activeTab,
        page: currentPage,
        limit: 6,
        query: searchQuery || undefined,
      });
      if (response && response.status === ResponseStatus.SUCCESS) {
        setMaterials(response.data.data as Material[]);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError("Failed to load materials");
      }
    } catch (err) {
      setError("An error occurred while loading materials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMaterials();
  };

  const handleReviewAction = (
    material: Material,
    action: ApprovalStatusEnum
  ) => {
    setSelectedMaterial(material);
    setReviewAction(action);
  };

  const handleDeleteAction = (material: Material) => {
    setSelectedMaterial(material);
    setIsDeleteDialogOpen(true);
  };

  const confirmReviewAction = async (
    action: ApprovalStatusEnum,
    comment: string
  ) => {
    if (!selectedMaterial) return;
    try {
      const payload: ReviewActionDTO = {
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-1 text-gray-600"
        >
          <ArrowLeft size={16} /> Back
        </Button>
        <h1 className="text-2xl font-bold">Materials Review</h1>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="Search materials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[240px]"
        />
        <Button type="submit" className="gap-1">
          <Search size={16} /> Search
        </Button>
      </form>

      <ReviewTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pendingCount={counts.pending}
        approvedCount={counts.approved}
        rejectedCount={counts.rejected}
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
              <p className="text-gray-600">
                {activeTab === ApprovalStatusEnum.PENDING
                  ? "There are no materials waiting for review."
                  : activeTab === ApprovalStatusEnum.APPROVED
                  ? "There are no approved materials."
                  : "There are no rejected materials."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="relative w-full aspect-video bg-gray-100">
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="h-12 w-12 text-gray-300" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-blue-600 text-white capitalize">
                        {material.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {material.label}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      by {material.creator.firstName}{" "}
                      {material.creator.lastName}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {material.description || "No description provided."}
                    </p>
                    {material.tags && material.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {material.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {material.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{material.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>Downloads: {material.downloads}</span>
                      <span>Likes: {material.likes}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeTab === ApprovalStatusEnum.PENDING && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 gap-1"
                            onClick={() =>
                              handleReviewAction(
                                material,
                                ApprovalStatusEnum.APPROVED
                              )
                            }
                          >
                            <CheckCircle size={14} /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() =>
                              handleReviewAction(
                                material,
                                ApprovalStatusEnum.REJECTED
                              )
                            }
                          >
                            <XCircle size={14} /> Reject
                          </Button>
                        </>
                      )}
                      {user.role === UserRole.ADMIN && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          onClick={() => handleDeleteAction(material)}
                        >
                          <Trash2 size={14} /> Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {materials.length > 0 && (
            <div className="flex items-center justify-between pt-6">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    currentPage > 1 && setCurrentPage(currentPage - 1)
                  }
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft size={14} /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    currentPage < totalPages && setCurrentPage(currentPage + 1)
                  }
                  disabled={currentPage >= totalPages}
                >
                  Next <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
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
    </div>
  );
};

export default MaterialsReviewPage;
