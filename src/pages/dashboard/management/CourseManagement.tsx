import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Loader2,
} from "lucide-react";
import {
  getCoursesPaginated,
  GetCoursesParams,
} from "@/api/course.api";
import { Course } from "@/lib/types/course.types";
import { ResponseStatus, UserRole } from "@/lib/types/response.types";
import CourseForm from "@/components/management/CourseForm";
import CourseModal from "@/components/management/CourseModal";

const CourseManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redirect if not admin or moderator
  useEffect(() => {
    if (user && user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Fetch courses on load
  useEffect(() => {
    fetchCourses();
  }, [currentPage]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: GetCoursesParams = {
        page: currentPage,
        limit: 10,
        allowDepartments: true,
        ...(searchQuery ? { query: searchQuery } : {}),
      };

      const response = await getCoursesPaginated(params);

      if (response?.status === ResponseStatus.SUCCESS) {
        setCourses(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError("Failed to load courses");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("An error occurred while loading courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchCourses();
  };

  const handleFormToggle = () => {
    setShowForm(!showForm);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchCourses();
    toast({
      title: "Success",
      description: "Course created successfully",
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsModalOpen(true);
  };

  const handleCourseDeleted = () => {
    // Refresh the courses list
    fetchCourses();
    toast({
      title: "Success",
      description: "Course deleted successfully",
    });
  };

  const handleBackToManagement = () => {
    navigate("/dashboard/management");
  };

  // If user not loaded yet or not admin/moderator, show nothing
  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR)) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToManagement}
            className="gap-2 mb-4 p-2 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Management
          </Button>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="mb-2 font-bold text-2xl sm:text-3xl">Course Management</h1>
            <p className="text-muted-foreground">
              Create new courses and link them to departments.
            </p>
          </div>
        </div>

        {/* Search and Add Course */}
        <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 max-w-full sm:max-w-md"
              />
            </div>
            <Button type="submit" size="default" className="gap-2 whitespace-nowrap">
              <Search size={16} />
              Search
            </Button>
          </form>
          <Button
            onClick={handleFormToggle}
            size="default"
            className="w-full sm:w-auto gap-2"
          >
            <Plus size={16} />
            {showForm ? "Cancel" : "Add Course"}
          </Button>
        </div>

        {/* Course Form */}
        {showForm && (
          <div className="bg-white shadow-sm mb-8 p-6 border rounded-xl">
            <h2 className="mb-4 font-semibold text-xl">Add New Course</h2>
            <CourseForm onSuccess={handleFormSuccess} />
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 size={32} className="text-brand animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-6 rounded-xl text-red-600 text-center">
              <p className="font-medium mb-2">Error Loading Courses</p>
              <p className="text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCourses}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-gray-50 p-12 rounded-xl text-center">
              <GraduationCap size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2 font-medium text-xl">No courses found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "No courses match your search criteria."
                  : "Get started by adding your first course."}
              </p>
              {!searchQuery && (
                <Button onClick={handleFormToggle} className="gap-2">
                  <Plus size={16} />
                  Add Course
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Courses Grid */}
              <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white hover:shadow-lg border rounded-xl overflow-hidden transition-all duration-200 group"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap size={20} className="text-brand" />
                          <Badge className="bg-brand/10 text-brand border-brand/20">
                            {course.courseCode}
                          </Badge>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-gray-50 text-xs"
                        >
                          {course.departments?.length || 0} departments
                        </Badge>
                      </div>

                      <h3 className="mb-2 font-semibold text-lg group-hover:text-brand transition-colors duration-200">
                        {course.courseName}
                      </h3>
                      <p className="mb-4 text-muted-foreground text-sm line-clamp-2">
                        {course.description || "No description provided."}
                      </p>

                      {course.departments && course.departments.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <div className="font-medium text-sm text-gray-600">
                            Offered in:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {course.departments.slice(0, 3).map((dept, index) => (
                              <Badge
                                key={`${dept.departmentId}-${index}`}
                                variant="secondary"
                                className="text-xs"
                              >
                                Level {dept.level}
                              </Badge>
                            ))}
                            {course.departments.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{course.departments.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCourse(course.id)}
                          className="gap-2 group-hover:border-brand group-hover:text-brand transition-colors duration-200"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {courses.length > 0 && totalPages > 1 && (
                <div className="flex xs:flex-row flex-col justify-between items-center gap-4 pt-8">
                  <p className="text-muted-foreground text-sm">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="gap-2"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="gap-2"
                    >
                      Next
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Course Modal */}
        <CourseModal
          courseId={selectedCourseId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCourseId(null);
          }}
          onCourseDeleted={handleCourseDeleted}
        />
      </div>
    </DashboardLayout>
  );
};

export default CourseManagement;