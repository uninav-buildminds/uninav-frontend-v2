import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUrlState } from "@/hooks/useUrlState";
import { useToast } from "@/hooks/use-toast";
import { useDepartments } from "@/hooks/useDepartments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/management/SearchBar";
import ReviewTabs from "@/components/management/ReviewTabs";
import ReviewPagination from "@/components/management/ReviewPagination";
import ReviewActionDialog from "@/components/management/ReviewActionDialog";
import DeleteConfirmationDialog from "@/components/management/DeleteConfirmationDialog";
import DLCReviewModal from "@/components/management/DLCReviewModal";
import {
  listDLCReviews,
  reviewDLC,
  deleteDLCAsAdmin,
  getDLCReviewCounts,
} from "@/api/review.api";
import { DLC } from "@/lib/types/dlc.types";
import {
  ApprovalStatusEnum,
  ResponseStatus,
  UserRole,
} from "@/lib/types/response.types";
import {
  Award,
  Loader2,
  Trash2,
  CheckCircle,
  XCircle,
  Building,
  GraduationCap,
} from "lucide-react";
import { ReviewActionDTO } from "@/lib/types/review.types";

const DLCReviewContent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { getDepartmentById } = useDepartments();

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

  const [dlcs, setDLCs] = useState<DLC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDLC, setSelectedDLC] = useState<DLC | null>(null);
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
    fetchDLCs();
  }, [activeTab, currentPage]);

  useEffect(() => {
    const fetchCounts = async () => {
      const response = await getDLCReviewCounts();
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

  const fetchDLCs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listDLCReviews({
        status: activeTab === "ALL" ? undefined : activeTab,
        page: currentPage,
        limit: 9,
        query: searchQuery || undefined,
      });
      if (response && response.status === ResponseStatus.SUCCESS) {
        setDLCs(response.data.data as DLC[]);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError("Failed to load department level courses");
      }
    } catch (err) {
      setError("An error occurred while loading department level courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchChange(searchQuery);
  };

  const handleReviewAction = (dlc: DLC, action: ApprovalStatusEnum) => {
    setSelectedDLC(dlc);
    setReviewAction(action);
  };

  // Approve DLC immediately without requiring a comment
  const approveDLCNow = async (dlc: DLC) => {
    try {
      const payload: ReviewActionDTO = {
        action: ApprovalStatusEnum.APPROVED,
        comment: undefined,
      };
      const response = await reviewDLC(dlc.departmentId, dlc.courseId, payload);
      if (response.status === ResponseStatus.SUCCESS) {
        toast({ title: "Success", description: "DLC approved" });
        setCounts((prev) => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          approved: prev.approved + 1,
        }));
        fetchDLCs();
      } else {
        toast({ title: "Error", description: "Action failed" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred" });
    }
  };

  const handleDeleteAction = (dlc: DLC) => {
    setSelectedDLC(dlc);
    setIsDeleteDialogOpen(true);
  };

  const handleDLCClick = (dlc: DLC) => {
    setSelectedDLC(dlc);
    setIsReviewModalOpen(true);
  };

  const handleModalClose = () => {
    setIsReviewModalOpen(false);
    setSelectedDLC(null);
  };

  const confirmReviewAction = async (
    action: ApprovalStatusEnum,
    comment: string
  ) => {
    if (!selectedDLC) return;
    try {
      const payload: ReviewActionDTO = {
        action,
        comment: comment.trim() || undefined,
      };
      const response = await reviewDLC(
        selectedDLC.departmentId,
        selectedDLC.courseId,
        payload
      );
      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Success",
          description: `DLC ${
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
        fetchDLCs();
      } else {
        toast({ title: "Error", description: "Action failed" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred" });
    }
  };

  const confirmDelete = async () => {
    if (!selectedDLC || user?.role !== UserRole.ADMIN) return;
    try {
      const response = await deleteDLCAsAdmin(
        selectedDLC.departmentId,
        selectedDLC.courseId
      );
      if (response.status === ResponseStatus.SUCCESS) {
        toast({ title: "Deleted", description: "DLC deleted successfully" });
        setCounts((prev) => ({
          ...prev,
          [activeTab.toLowerCase()]: Math.max(
            0,
            prev[activeTab.toLowerCase()] - 1
          ),
        }));
        fetchDLCs();
      } else {
        toast({ title: "Error", description: "Failed to delete DLC" });
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
        <h1 className="text-2xl font-bold">DLC Review</h1>
      </div>

      <SearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSubmit={handleSearch}
        placeholder="Search DLCs..."
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
          ) : dlcs.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No department level courses found
              </h3>
              <p className="text-gray-600">
                {activeTab === ApprovalStatusEnum.PENDING
                  ? "There are no department level courses waiting for review."
                  : activeTab === ApprovalStatusEnum.APPROVED
                  ? "There are no approved department level courses."
                  : "There are no rejected department level courses."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
              {dlcs.map((dlc) => (
                <div
                  key={`${dlc.departmentId}-${dlc.courseId}`}
                  className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                  onClick={() => handleDLCClick(dlc)}
                >
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {dlc.course.courseName}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building size={10} className="text-blue-600" />
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            {getDepartmentById(dlc.departmentId)?.name ||
                              dlc.departmentId}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className="bg-purple-600 text-white text-xs flex-shrink-0">
                          Level {dlc.level}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs flex-shrink-0 ${
                            dlc.reviewStatus === ApprovalStatusEnum.APPROVED
                              ? "bg-green-100 text-green-700 border-green-200"
                              : dlc.reviewStatus === ApprovalStatusEnum.REJECTED
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          {dlc.reviewStatus}
                        </Badge>
                      </div>
                    </div>

                    {dlc.course.description && (
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3">
                        {dlc.course.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-500">
                        <span className="hidden xs:inline">
                          Code: {dlc.course.courseCode}
                        </span>
                        <span className="xs:hidden">
                          {dlc.course.courseCode}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            approveDLCNow(dlc);
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
                              dlc,
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
                            handleDeleteAction(dlc);
                          }}
                          title="Delete DLC"
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

      {selectedDLC && reviewAction && (
        <ReviewActionDialog
          isOpen={!!reviewAction}
          onClose={() => setReviewAction(null)}
          onConfirm={confirmReviewAction}
          action={reviewAction}
          contentType="Department Level Course"
        />
      )}

      {selectedDLC && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          contentType="Department Level Course"
          itemName={`${selectedDLC.course.courseCode} for ${
            getDepartmentById(selectedDLC.departmentId)?.name ||
            selectedDLC.departmentId
          } (Level ${selectedDLC.level})`}
        />
      )}

      <DLCReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleModalClose}
        dlc={selectedDLC}
        onApprove={approveDLCNow}
        onReject={(dlc) => handleReviewAction(dlc, ApprovalStatusEnum.REJECTED)}
        onDelete={handleDeleteAction}
        activeTab={activeTab}
      />
    </div>
  );
};

const DLCReviewPage: React.FC = () => {
  return <DLCReviewContent />;
};

export default DLCReviewPage;
