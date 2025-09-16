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
  listAdvertReviews,
  reviewAdvert,
  deleteAdvertAsAdmin,
  getAdvertReviewCounts,
  ReviewActionDTO,
  Advert,
} from "@/api/review.api";
import {
  ApprovalStatusEnum,
  ResponseStatus,
  UserRole,
} from "@/lib/types/response.types";
import {
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

const AdvertsReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(
    ApprovalStatusEnum.PENDING
  );
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAdvert, setSelectedAdvert] = useState<Advert | null>(null);
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
    fetchAdverts();
  }, [activeTab, currentPage]);

  useEffect(() => {
    const fetchCounts = async () => {
      const response = await getAdvertReviewCounts();
      if (response && response.status === ResponseStatus.SUCCESS) {
        setCounts(response.data);
      }
    };
    fetchCounts();
  }, []);

  const fetchAdverts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listAdvertReviews({
        status: activeTab,
        page: currentPage,
        limit: 6,
        query: searchQuery || undefined,
      });
      if (response && response.status === ResponseStatus.SUCCESS) {
        setAdverts(response.data.data as Advert[]);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError("Failed to load advertisements");
      }
    } catch (err) {
      setError("An error occurred while loading advertisements");
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
    fetchAdverts();
  };

  const handleReviewAction = (advert: Advert, action: ApprovalStatusEnum) => {
    setSelectedAdvert(advert);
    setReviewAction(action);
  };

  const handleDeleteAction = (advert: Advert) => {
    setSelectedAdvert(advert);
    setIsDeleteDialogOpen(true);
  };

  const confirmReviewAction = async (
    action: ApprovalStatusEnum,
    comment: string
  ) => {
    if (!selectedAdvert) return;
    try {
      const payload: ReviewActionDTO = {
        action,
        comment: comment.trim() || undefined,
      };
      const response = await reviewAdvert(selectedAdvert.id, payload);
      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Success",
          description: `Advertisement ${
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
        fetchAdverts();
      } else {
        toast({ title: "Error", description: "Action failed" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred" });
    }
  };

  const confirmDelete = async () => {
    if (!selectedAdvert || user?.role !== UserRole.ADMIN) return;
    try {
      const response = await deleteAdvertAsAdmin(selectedAdvert.id);
      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Deleted",
          description: "Advertisement deleted successfully",
        });
        setCounts((prev) => ({
          ...prev,
          [activeTab.toLowerCase()]: Math.max(
            0,
            (prev as any)[activeTab.toLowerCase()] - 1
          ),
        }));
        fetchAdverts();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete advertisement",
        });
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
        <h1 className="text-2xl font-bold">Advertisements Review</h1>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="Search advertisements..."
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
          ) : adverts.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No advertisements found
              </h3>
              <p className="text-gray-600">
                {activeTab === ApprovalStatusEnum.PENDING
                  ? "There are no advertisements waiting for review."
                  : activeTab === ApprovalStatusEnum.APPROVED
                  ? "There are no approved advertisements."
                  : "There are no rejected advertisements."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {adverts.map((advert) => (
                <div
                  key={advert.id}
                  className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="relative w-full aspect-video bg-gray-100">
                    {advert.bannerImageAddress ? (
                      <img
                        src={advert.bannerImageAddress}
                        alt={advert.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/assets/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Megaphone className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-purple-600 text-white capitalize">
                        {advert.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {advert.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      by {advert.creator.firstName} {advert.creator.lastName}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {advert.description || "No description provided."}
                    </p>
                    {advert.externalLink && (
                      <div className="flex items-center gap-1 mb-3">
                        <ExternalLink size={12} className="text-blue-600" />
                        <a
                          href={advert.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline truncate"
                        >
                          {advert.externalLink}
                        </a>
                      </div>
                    )}
                    {advert.tags && advert.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {advert.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {advert.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{advert.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>Views: {advert.views}</span>
                      <span>Clicks: {advert.clicks}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeTab === ApprovalStatusEnum.PENDING && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 gap-1"
                            onClick={() =>
                              handleReviewAction(
                                advert,
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
                                advert,
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
                          onClick={() => handleDeleteAction(advert)}
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

          {adverts.length > 0 && (
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

      {selectedAdvert && reviewAction && (
        <ReviewActionDialog
          isOpen={!!reviewAction}
          onClose={() => setReviewAction(null)}
          onConfirm={confirmReviewAction}
          action={reviewAction}
          contentType="Advertisement"
        />
      )}

      {selectedAdvert && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          contentType="Advertisement"
          itemName={selectedAdvert.title}
        />
      )}
    </div>
  );
};

export default AdvertsReviewPage;
