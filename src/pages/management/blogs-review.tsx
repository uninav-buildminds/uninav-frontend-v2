import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUrlState } from "@/hooks/useUrlState";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/management/SearchBar";
import ReviewTabs from "@/components/management/ReviewTabs";
import ReviewPagination from "@/components/management/ReviewPagination";
import ReviewActionDialog from "@/components/management/ReviewActionDialog";
import DeleteConfirmationDialog from "@/components/management/DeleteConfirmationDialog";
import {
  listBlogReviews,
  reviewBlog,
  deleteBlogAsAdmin,
  getBlogReviewCounts,
  ReviewActionDTO,
} from "@/api/review.api";
import { Blog } from "@/lib/types/blog.types";
import {
  ApprovalStatusEnum,
  ResponseStatus,
  UserRole,
} from "@/lib/types/response.types";
import {
  FileText,
  Loader2,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";

const BlogsReviewContent: React.FC = () => {
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

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [reviewAction, setReviewAction] = useState<ApprovalStatusEnum | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
    fetchBlogs();
  }, [activeTab, currentPage]);

  useEffect(() => {
    const fetchCounts = async () => {
      const response = await getBlogReviewCounts();
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

  const fetchBlogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listBlogReviews({
        status: activeTab === "ALL" ? undefined : activeTab,
        page: currentPage,
        limit: 6,
        query: searchQuery || undefined,
      });
      if (response && response.status === ResponseStatus.SUCCESS) {
        setBlogs(response.data.data as Blog[]);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError("Failed to load blogs");
      }
    } catch (err) {
      setError("An error occurred while loading blogs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchChange(searchQuery);
    fetchBlogs(); // Trigger the actual search
  };

  const handleReviewAction = (blog: Blog, action: ApprovalStatusEnum) => {
    setSelectedBlog(blog);
    setReviewAction(action);
  };

  const handleDeleteAction = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsDeleteDialogOpen(true);
  };

  const confirmReviewAction = async (
    action: ApprovalStatusEnum,
    comment: string
  ) => {
    if (!selectedBlog) return;
    try {
      const payload: ReviewActionDTO = {
        action,
        comment: comment.trim() || undefined,
      };
      const response = await reviewBlog(selectedBlog.id, payload);
      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Success",
          description: `Blog ${
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
        fetchBlogs();
      } else {
        toast({ title: "Error", description: "Action failed" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred" });
    }
  };

  const confirmDelete = async () => {
    if (!selectedBlog || user?.role !== UserRole.ADMIN) return;
    try {
      const response = await deleteBlogAsAdmin(selectedBlog.id);
      if (response.status === ResponseStatus.SUCCESS) {
        toast({ title: "Deleted", description: "Blog deleted successfully" });
        setCounts((prev) => ({
          ...prev,
          [activeTab.toLowerCase()]: Math.max(
            0,
            (prev as any)[activeTab.toLowerCase()] - 1
          ),
        }));
        fetchBlogs();
      } else {
        toast({ title: "Error", description: "Failed to delete blog" });
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
        <h1 className="text-2xl font-bold">Blogs Review</h1>
      </div>

      <SearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSubmit={handleSearch}
        placeholder="Search blogs..."
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
          ) : blogs.length === 0 ? (
            <div className="bg-gray-50 p-4 sm:p-6 md:p-8 rounded-lg text-center">
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-2 sm:mb-3 md:mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No blogs found</h3>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                {activeTab === "ALL"
                  ? "There are no blogs found."
                  : activeTab === ApprovalStatusEnum.PENDING
                  ? "There are no blogs waiting for review."
                  : activeTab === ApprovalStatusEnum.APPROVED
                  ? "There are no approved blogs."
                  : "There are no rejected blogs."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="relative w-full aspect-video bg-gray-100">
                    {blog.headingImageAddress ? (
                      <img
                        src={blog.headingImageAddress}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/assets/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FileText className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-blue-600 text-white capitalize">
                        {blog.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      by {blog.creator.firstName} {blog.creator.lastName}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {blog.description || "No description provided."}
                    </p>
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {blog.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {blog.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{blog.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>Views: {blog.views}</span>
                      <span>Likes: {blog.likes}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 gap-1"
                        onClick={() =>
                          handleReviewAction(blog, ApprovalStatusEnum.APPROVED)
                        }
                      >
                        <CheckCircle size={14} /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        onClick={() =>
                          handleReviewAction(blog, ApprovalStatusEnum.REJECTED)
                        }
                      >
                        <XCircle size={14} /> Reject
                      </Button>
                      {user.role === UserRole.ADMIN && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          onClick={() => handleDeleteAction(blog)}
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

          <ReviewPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </ReviewTabs>

      {selectedBlog && reviewAction && (
        <ReviewActionDialog
          isOpen={!!reviewAction}
          onClose={() => setReviewAction(null)}
          onConfirm={confirmReviewAction}
          action={reviewAction}
          contentType="Blog"
        />
      )}

      {selectedBlog && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          contentType="Blog"
          itemName={selectedBlog.title}
        />
      )}
    </div>
  );
};

const BlogsReviewPage: React.FC = () => {
  return <BlogsReviewContent />;
};

export default BlogsReviewPage;
