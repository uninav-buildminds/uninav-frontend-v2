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
import ManagementLayout from "@/layouts/ManagementLayout";
import {
  listCourseReviews,
  reviewCourse,
  deleteCourseAsAdmin,
  getCourseReviewCounts,
  ReviewActionDTO,
} from "@/api/review.api";
import { Course } from "@/lib/types/course.types";
import {
  ApprovalStatusEnum,
  ResponseStatus,
  UserRole,
} from "@/lib/types/response.types";
import {
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";

const CoursesReviewContent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(
    ApprovalStatusEnum.PENDING
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [reviewAction, setReviewAction] = useState<ApprovalStatusEnum | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
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
    fetchCourses();
  }, [activeTab, currentPage]);

  useEffect(() => {
    const fetchCounts = async () => {
      const response = await getCourseReviewCounts();
      if (response && response.status === ResponseStatus.SUCCESS) {
        setCounts(response.data);
      }
    };
    fetchCounts();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listCourseReviews({
        status: activeTab,
        page: currentPage,
        limit: 9,
        query: searchQuery || undefined,
      });
      if (response && response.status === ResponseStatus.SUCCESS) {
        setCourses(response.data.data as Course[]);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError("Failed to load courses");
      }
    } catch (err) {
      setError("An error occurred while loading courses");
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
    fetchCourses();
  };

  const handleReviewAction = (course: Course, action: ApprovalStatusEnum) => {
    setSelectedCourse(course);
    setReviewAction(action);
  };

  const handleDeleteAction = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const confirmReviewAction = async (
    action: ApprovalStatusEnum,
    comment: string
  ) => {
    if (!selectedCourse) return;
    try {
      const payload: ReviewActionDTO = {
        action,
        comment: comment.trim() || undefined,
      };
      const response = await reviewCourse(selectedCourse.id, payload);
      if (response.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Success",
          description: `Course ${
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
        fetchCourses();
      } else {
        toast({ title: "Error", description: "Action failed" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred" });
    }
  };

  const confirmDelete = async () => {
    if (!selectedCourse || user?.role !== UserRole.ADMIN) return;
    try {
      const response = await deleteCourseAsAdmin(selectedCourse.id);
      if (response.status === ResponseStatus.SUCCESS) {
        toast({ title: "Deleted", description: "Course deleted successfully" });
        setCounts((prev) => ({
          ...prev,
          [activeTab.toLowerCase()]: Math.max(
            0,
            (prev as any)[activeTab.toLowerCase()] - 1
          ),
        }));
        fetchCourses();
      } else {
        toast({ title: "Error", description: "Failed to delete course" });
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
        <h1 className="text-2xl font-bold">Courses Review</h1>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="Search courses..."
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
          ) : courses.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No courses found</h3>
              <p className="text-gray-600">
                {activeTab === ApprovalStatusEnum.PENDING
                  ? "There are no courses waiting for review."
                  : activeTab === ApprovalStatusEnum.APPROVED
                  ? "There are no approved courses."
                  : "There are no rejected courses."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center border-2 border-blue-100">
                      <GraduationCap size={24} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {course.courseName}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-3">
                    <p>
                      <span className="font-medium">Code:</span>{" "}
                      {course.courseCode}
                    </p>
                    {course.departments && course.departments.length > 0 && (
                      <p>
                        <span className="font-medium">Departments:</span>{" "}
                        {course.departments.length}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {course.description || "No description provided."}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {activeTab === ApprovalStatusEnum.PENDING && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 gap-1"
                          onClick={() =>
                            handleReviewAction(
                              course,
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
                              course,
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
                        onClick={() => handleDeleteAction(course)}
                      >
                        <Trash2 size={14} /> Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {courses.length > 0 && (
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

      {selectedCourse && reviewAction && (
        <ReviewActionDialog
          isOpen={!!reviewAction}
          onClose={() => setReviewAction(null)}
          onConfirm={confirmReviewAction}
          action={reviewAction}
          contentType="Course"
        />
      )}

      {selectedCourse && (
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          contentType="Course"
          itemName={selectedCourse.courseName}
        />
      )}
    </div>
  );
};

const CoursesReviewPage: React.FC = () => {
  return (
    <ManagementLayout>
      <CoursesReviewContent />
    </ManagementLayout>
  );
};

export default CoursesReviewPage;
