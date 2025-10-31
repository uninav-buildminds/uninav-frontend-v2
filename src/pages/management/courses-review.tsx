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
  listCourseReviews,
  reviewCourse,
  deleteCourseAsAdmin,
  getCourseReviewCounts,
} from "@/api/review.api";
import { Course } from "@/lib/types/course.types";
import {
  ApprovalStatusEnum,
  ResponseStatus,
  UserRole,
} from "@/lib/types/response.types";
import { ReviewActionDTO } from "@/lib/types/review.types";
import {
  GraduationCap,
  Loader2,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

const CoursesReviewContent: React.FC = () => {
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

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    fetchCourses();
  }, [activeTab, currentPage]);

  useEffect(() => {
    const fetchCounts = async () => {
      const response = await getCourseReviewCounts();
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

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listCourseReviews({
        status: activeTab === "ALL" ? undefined : activeTab,
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchChange(searchQuery);
    fetchCourses(); // Trigger the actual search
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

      <SearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSubmit={handleSearch}
        placeholder="Search courses..."
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
          ) : courses.length === 0 ? (
            <div className="bg-gray-50 p-4 sm:p-6 md:p-8 rounded-lg text-center">
              <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-2 sm:mb-3 md:mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No courses found</h3>
              <p className="text-sm sm:text-base text-gray-600 px-2">
                {activeTab === ApprovalStatusEnum.PENDING
                  ? "There are no courses waiting for review."
                  : activeTab === ApprovalStatusEnum.APPROVED
                  ? "There are no approved courses."
                  : "There are no rejected courses."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {course.courseName}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                            <GraduationCap
                              size={10}
                              className="text-blue-600"
                            />
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            Course
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className="bg-blue-600 text-white text-xs flex-shrink-0">
                          {course.courseCode}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs flex-shrink-0 ${
                            course.reviewStatus === ApprovalStatusEnum.APPROVED
                              ? "bg-green-100 text-green-700 border-green-200"
                              : course.reviewStatus ===
                                ApprovalStatusEnum.REJECTED
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }`}
                        >
                          {course.reviewStatus}
                        </Badge>
                      </div>
                    </div>

                    {course.description && (
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3">
                        {course.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-500">
                        {course.departments &&
                          course.departments.length > 0 && (
                            <>
                              <span className="hidden xs:inline">
                                Departments: {course.departments.length}
                              </span>
                              <span className="xs:hidden">
                                {course.departments.length} depts
                              </span>
                            </>
                          )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-7"
                          onClick={() =>
                            handleReviewAction(
                              course,
                              ApprovalStatusEnum.APPROVED
                            )
                          }
                        >
                          <CheckCircle size={12} className="mr-1" />
                          <span className="hidden sm:inline">Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs px-2 py-1 h-7"
                          onClick={() =>
                            handleReviewAction(
                              course,
                              ApprovalStatusEnum.REJECTED
                            )
                          }
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
                          onClick={() => handleDeleteAction(course)}
                          title="Delete course"
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
  return <CoursesReviewContent />;
};

export default CoursesReviewPage;
