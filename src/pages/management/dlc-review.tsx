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
  listDLCReviews,
  reviewDLC,
  deleteDLCAsAdmin,
  getDLCReviewCounts,
  ReviewActionDTO,
} from "@/api/review.api";
import { DLC } from "@/lib/types/dlc.types";
import { ApprovalStatusEnum, ResponseStatus, UserRole } from "@/lib/types/response.types";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Building,
  GraduationCap,
} from "lucide-react";

const DLCReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(ApprovalStatusEnum.PENDING);
  const [dlcs, setDLCs] = useState<DLC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDLC, setSelectedDLC] = useState<DLC | null>(null);
  const [reviewAction, setReviewAction] = useState<ApprovalStatusEnum | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    if (user && user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
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
        setCounts(response.data);
      }
    };
    fetchCounts();
  }, []);

  const fetchDLCs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listDLCReviews({
        status: activeTab,
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDLCs();
  };

  const handleReviewAction = (dlc: DLC, action: ApprovalStatusEnum) => {
    setSelectedDLC(dlc);
    setReviewAction(action);
  };

  const handleDeleteAction = (dlc: DLC) => {
    setSelectedDLC(dlc);
    setIsDeleteDialogOpen(true);
  };

  const confirmReviewAction = async (action: ApprovalStatusEnum, comment: string) => {
    if (!selectedDLC) return;
    try {
      const payload: ReviewActionDTO = { action, comment: comment.trim() || undefined };
      const response = await reviewDLC(selectedDLC.departmentId, selectedDLC.courseId, payload);
      if (response.status === ResponseStatus.SUCCESS) {
        toast({ title: "Success", description: `DLC ${action === ApprovalStatusEnum.APPROVED ? "approved" : "rejected"}` });
        setCounts((prev) => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          [action === ApprovalStatusEnum.APPROVED ? "approved" : "rejected"]:
            prev[action === ApprovalStatusEnum.APPROVED ? "approved" : "rejected"] + 1,
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
      const response = await deleteDLCAsAdmin(selectedDLC.departmentId, selectedDLC.courseId);
      if (response.status === ResponseStatus.SUCCESS) {
        toast({ title: "Deleted", description: "DLC deleted successfully" });
        setCounts((prev) => ({
          ...prev,
          [activeTab.toLowerCase()]: Math.max(0, (prev as any)[activeTab.toLowerCase()] - 1),
        }));
        fetchDLCs();
      } else {
        toast({ title: "Error", description: "Failed to delete DLC" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred" });
    }
  };

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR)) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1 text-gray-600">
          <ArrowLeft size={16} /> Back
        </Button>
        <h1 className="text-2xl font-bold">DLC Review</h1>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="Search DLCs..."
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
          ) : dlcs.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No department level courses found</h3>
              <p className="text-gray-600">
                {activeTab === ApprovalStatusEnum.PENDING
                  ? "There are no department level courses waiting for review."
                  : activeTab === ApprovalStatusEnum.APPROVED
                  ? "There are no approved department level courses."
                  : "There are no rejected department level courses."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {dlcs.map((dlc) => (
                <div key={`${dlc.departmentId}-${dlc.courseId}`} className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-blue-700 font-medium">
                      <Building size={18} /> Department
                    </div>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">Level {dlc.level}</Badge>
                  </div>
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <h3 className="font-semibold text-lg mb-1">{dlc.department.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{dlc.department.description || "No description"}</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                    <GraduationCap size={18} /> Course
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">{dlc.course.courseName}</h4>
                      <Badge className="bg-blue-100 text-blue-700 uppercase">{dlc.course.courseCode}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{dlc.course.description || "No description"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {activeTab === ApprovalStatusEnum.PENDING && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1" onClick={() => handleReviewAction(dlc, ApprovalStatusEnum.APPROVED)}>
                          <CheckCircle size={14} /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleReviewAction(dlc, ApprovalStatusEnum.REJECTED)}>
                          <XCircle size={14} /> Reject
                        </Button>
                      </>
                    )}
                    {user.role === UserRole.ADMIN && (
                      <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleDeleteAction(dlc)}>
                        <Trash2 size={14} /> Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {dlcs.length > 0 && (
            <div className="flex items-center justify-between pt-6">
              <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} disabled={currentPage <= 1}>
                  <ChevronLeft size={14} /> Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages}>
                  Next <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
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
          itemName={`${selectedDLC.course.courseCode} for ${selectedDLC.department.name} (Level ${selectedDLC.level})`}
        />
      )}
    </div>
  );
};

export default DLCReviewPage;