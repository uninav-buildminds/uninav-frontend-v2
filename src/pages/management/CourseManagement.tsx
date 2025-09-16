import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { getCoursesPaginated } from "@/api/course.api";
import { GetCoursesParams } from "@/lib/types/course.types";
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
    if (
      user &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.MODERATOR
    ) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Fetch courses
  const fetchCourses = async (page: number = 1, search: string = "") => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page,
        limit: 10,
        ...(search && { query: search }),
        allowDepartments: true,
      };

      const response = await getCoursesPaginated(params);

      if (response.status === ResponseStatus.SUCCESS) {
        setCourses(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(page);
      } else {
        setError(response.message || "Failed to fetch courses");
        toast({
          title: "Error",
          description: response.message || "Failed to fetch courses",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = "An error occurred while fetching courses";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCourses(1, searchQuery);
  }, []);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchCourses(1, searchQuery);
  };

  // Handle search on enter
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    fetchCourses(page, searchQuery);
  };

  // Handle course creation success
  const handleCourseCreated = () => {
    setShowForm(false);
    fetchCourses(currentPage, searchQuery);
    toast({
      title: "Success",
      description: "Course created successfully",
    });
  };

  // Handle course click
  const handleCourseClick = (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsModalOpen(true);
  };

  // Handle course updated
  const handleCourseUpdated = () => {
    fetchCourses(currentPage, searchQuery);
    setIsModalOpen(false);
    setSelectedCourseId(null);
  };

  // Handle course deleted
  const handleCourseDeleted = () => {
    fetchCourses(currentPage, searchQuery);
    setIsModalOpen(false);
    setSelectedCourseId(null);
    toast({
      title: "Success",
      description: "Course deleted successfully",
    });
  };

  // If user not loaded yet or not admin/moderator, show loading or nothing
  if (
    !user ||
    (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR)
  ) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Course Management
        </h1>
        <p className="text-gray-600">
          Create, link, and manage courses across departments.
        </p>
      </div>

      {/* Add Course Form */}
      {showForm && (
        <div className="mb-8">
          <div className="bg-white border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add New Course</h2>
              <Button
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </Button>
            </div>
            <CourseForm onSuccess={handleCourseCreated} />
          </div>
        </div>
      )}

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 max-w-md">
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSearch} variant="outline" size="icon">
            <Search size={16} />
          </Button>
        </div>

        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus size={16} />
            Add Course
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Loading courses...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-12">
          <div className="text-red-600 mb-2">⚠️ {error}</div>
          <Button
            variant="outline"
            onClick={() => fetchCourses(currentPage, searchQuery)}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Courses Grid */}
      {!isLoading && !error && (
        <>
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? "No courses match your search criteria."
                  : "Get started by adding your first course."}
              </p>
              {!showForm && (
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <Plus size={16} />
                  Add First Course
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white border rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center border-2 border-blue-100 group-hover:scale-105 transition-transform duration-200">
                        <GraduationCap size={24} />
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {course.courseName}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Code:</span>{" "}
                        {course.courseCode}
                      </p>
                      {course.departments && (
                        <p>
                          <span className="font-medium">Department:</span>{" "}
                          {course.departments
                            .map((dept) => dept.department.name)
                            .join(", ")}
                        </p>
                      )}
                    </div>

                    {course.description && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="gap-1"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Course Details Modal */}
      {selectedCourseId && (
        <CourseModal
          courseId={selectedCourseId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCourseId(null);
          }}
          onCourseUpdated={handleCourseUpdated}
          onCourseDeleted={handleCourseDeleted}
        />
      )}
    </div>
  );
};

export default CourseManagement;
