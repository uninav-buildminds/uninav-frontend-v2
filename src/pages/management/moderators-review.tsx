import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ReviewTabs from "@/components/management/ReviewTabs";
import ReviewActionDialog from "@/components/management/ReviewActionDialog";
import {
  listModeratorApplications,
  reviewModeratorApplication,
  getModeratorReviewCounts,
  ReviewActionDTO,
  ModeratorApplication,
} from "@/api/review.api";
import {
  ApprovalStatusEnum,
  ResponseStatus,
  UserRole,
} from "@/lib/types/response.types";
import {
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Mail,
  Calendar,
} from "lucide-react";

const ModeratorsReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(
    ApprovalStatusEnum.PENDING
  );
  const [applications, setApplications] = useState<ModeratorApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedApplication, setSelectedApplication] =
    useState<ModeratorApplication | null>(null);
  const [reviewAction, setReviewAction] = useState<ApprovalStatusEnum | null>(
    null
  );
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Access Control - Only admins can access this page
  useEffect(() => {
    if (user && user.role !== UserRole.ADMIN) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchApplications();
  }, [activeTab, currentPage]);

  useEffect(() => {
    const fetchCounts = async () => {
      const response = await getModeratorReviewCounts();
      if (response && response.status === ResponseStatus.SUCCESS) {
        setCounts(response.data);
      }
    };
    fetchCounts();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listModeratorApplications({
        status: activeTab,
        page: currentPage,
        limit: 6,
        query: searchQuery || undefined,
      });
      if (response && response.status === ResponseStatus.SUCCESS) {
        setApplications(response.data.data as ModeratorApplication[]);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError("Failed to load moderator applications");
      }
    } catch (err) {
      setError("An error occurred while loading applications");
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
    fetchApplications();
  };

  const handleReviewAction = (
    application: ModeratorApplication,
    action: ApprovalStatusEnum
  ) => {
    setSelectedApplication(application);
    setReviewAction(action);
  };

  const confirmReviewAction = async (
    action: ApprovalStatusEnum,
    comment: string
  ) => {
    if (!selectedApplication) return;
    try {
      const payload: ReviewActionDTO = {
        action,
        comment: comment.trim() || undefined,
      };
      const response = await reviewModeratorApplication(
        selectedApplication.userId,
        payload
      );
      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Success",
          description: `Moderator application ${
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
        fetchApplications();
      } else {
        toast({ title: "Error", description: "Action failed" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred" });
    }
  };

  if (!user || user.role !== UserRole.ADMIN) return null;

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
        <h1 className="text-2xl font-bold">Moderator Applications</h1>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="Search applications..."
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
          ) : applications.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No applications found
              </h3>
              <p className="text-gray-600">
                {activeTab === ApprovalStatusEnum.PENDING
                  ? "There are no moderator applications waiting for review."
                  : activeTab === ApprovalStatusEnum.APPROVED
                  ? "There are no approved applications."
                  : "There are no rejected applications."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <UserCheck className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {application.user.firstName}{" "}
                          {application.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          @{application.user.username}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        application.reviewStatus === ApprovalStatusEnum.PENDING
                          ? "outline"
                          : application.reviewStatus ===
                            ApprovalStatusEnum.APPROVED
                          ? "default"
                          : "destructive"
                      }
                      className="capitalize"
                    >
                      {application.reviewStatus}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} />
                      <span className="truncate">{application.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      <span>
                        Applied on{" "}
                        {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <h4 className="font-medium text-sm mb-2">
                      Application Reason:
                    </h4>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {application.reason}
                    </p>
                  </div>

                  {activeTab === ApprovalStatusEnum.PENDING && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 gap-1 flex-1"
                        onClick={() =>
                          handleReviewAction(
                            application,
                            ApprovalStatusEnum.APPROVED
                          )
                        }
                      >
                        <CheckCircle size={14} /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1 flex-1"
                        onClick={() =>
                          handleReviewAction(
                            application,
                            ApprovalStatusEnum.REJECTED
                          )
                        }
                      >
                        <XCircle size={14} /> Reject
                      </Button>
                    </div>
                  )}

                  {application.reviewStatus !== ApprovalStatusEnum.PENDING &&
                    application.reviewedById && (
                      <div className="text-xs text-gray-500 border-t pt-3">
                        <span>
                          Reviewed on{" "}
                          {new Date(application.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}

          {applications.length > 0 && (
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

      {selectedApplication && reviewAction && (
        <ReviewActionDialog
          isOpen={!!reviewAction}
          onClose={() => setReviewAction(null)}
          onConfirm={confirmReviewAction}
          action={reviewAction}
          contentType="Moderator Application"
        />
      )}
    </div>
  );
};

export default ModeratorsReviewPage;
