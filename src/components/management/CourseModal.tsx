import React, { useState, useEffect } from "react";
import {
  getCourseById,
  updateCourse,
  deleteCourse,
  unlinkCourseToDepartment,
} from "@/api/course.api";
import { Course, UpdateCourseRequest } from "@/lib/types/course.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Loader2, Trash2, Edit2, X, Save } from "lucide-react";
import { LinkCourseForm } from "@/components/management/CourseForm";
import { useToast } from "@/hooks/use-toast";

interface CourseModalProps {
  courseId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCourseDeleted?: () => void;
}

const CourseModal: React.FC<CourseModalProps> = ({
  courseId,
  isOpen,
  onClose,
  onCourseDeleted,
}) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUnlinkDialog, setShowUnlinkDialog] = useState<{
    departmentId: string;
    show: boolean;
  }>({ departmentId: "", show: false });
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    courseName: "",
    courseCode: "",
    description: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    if (courseId && isOpen) {
      fetchCourseDetails();
    }
  }, [courseId, isOpen]);

  useEffect(() => {
    if (course) {
      setEditFormData({
        courseName: course.courseName,
        courseCode: course.courseCode,
        description: course.description || "",
      });
    }
  }, [course]);

  const fetchCourseDetails = async () => {
    if (!courseId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await getCourseById(courseId);
      if (response?.status === "success") {
        setCourse(response.data as Course);
      }
    } catch (err) {
      console.error("Error fetching course details:", err);
      setError("Failed to load course details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "courseCode") {
      // Remove spaces from course code
      const cleanedValue = value.replace(/\s+/g, "");
      if (value !== cleanedValue) {
        toast({
          title: "Invalid Input",
          description:
            "Course code cannot contain spaces. Spaces have been removed.",
          variant: "destructive",
        });
      }
      if (value.length >= 7) {
        toast({
          title: "Invalid Input",
          description: "Course code cannot be more than 7 characters",
          variant: "destructive",
        });
        return;
      }
      setEditFormData((prev) => ({ ...prev, [name]: cleanedValue }));
    } else {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    try {
      setIsUpdating(true);
      const updateData: UpdateCourseRequest = {
        courseName: editFormData.courseName,
        courseCode: editFormData.courseCode,
        description: editFormData.description,
      };

      await updateCourse(course.id, updateData);
      await fetchCourseDetails();
      setShowEditForm(false);
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;
    try {
      setIsDeleting(true);
      await deleteCourse(course.id);
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      onCourseDeleted?.();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleUnlinkDepartment = async (departmentId: string) => {
    if (!course) return;
    try {
      await unlinkCourseToDepartment(departmentId, course.id);
      await fetchCourseDetails();
      toast({
        title: "Success",
        description: "Course unlinked from department successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to unlink course from department",
        variant: "destructive",
      });
    } finally {
      setShowUnlinkDialog({ departmentId: "", show: false });
    }
  };

  const handleUnlinkClick = (departmentId: string) => {
    setShowUnlinkDialog({
      departmentId,
      show: true,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog
        open={isOpen && !(showDeleteDialog || showUnlinkDialog.show)}
        onOpenChange={onClose}
      >
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-6 rounded-xl text-red-600 text-center">
              <p className="font-medium mb-2">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : course ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 font-bold text-2xl">
                  <Badge className="bg-brand/10 text-brand border-brand/20">
                    {course.courseCode}
                  </Badge>
                  {course.courseName}
                </DialogTitle>
              </DialogHeader>

              <div className="gap-8 grid grid-cols-1 xl:grid-cols-4 mt-6">
                {/* Course Information */}
                <div className="space-y-8 order-2 xl:order-1 xl:col-span-3">
                  {showEditForm ? (
                    <div className="bg-white shadow-sm p-6 border rounded-xl">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">Edit Course</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowEditForm(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <form onSubmit={handleUpdateCourse} className="space-y-4">
                        <div className="gap-4 grid grid-cols-1 lg:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="courseName">Course Name</Label>
                            <Input
                              id="courseName"
                              name="courseName"
                              value={editFormData.courseName}
                              onChange={handleEditInputChange}
                              placeholder="e.g., Introduction to Computer Science"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="courseCode">Course Code</Label>
                            <Input
                              id="courseCode"
                              name="courseCode"
                              value={editFormData.courseCode}
                              onChange={handleEditInputChange}
                              placeholder="e.g., CS101"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">
                            Course Description
                          </Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={editFormData.description}
                            onChange={handleEditInputChange}
                            placeholder="Brief description of the course"
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowEditForm(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isUpdating}
                            className="gap-2"
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <Save size={16} />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-white shadow-sm p-6 border rounded-xl">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="mb-2 font-semibold text-lg">
                            Course Details
                          </h3>
                          <p className="mb-4 text-muted-foreground">
                            {course.description || "No description provided."}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Created:{" "}
                              {new Date(course.createdAt).toLocaleDateString()}
                            </span>
                            <Badge
                              variant={
                                course.reviewStatus === "approved"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                course.reviewStatus === "approved"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : ""
                              }
                            >
                              {course.reviewStatus}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowEditForm(true)}
                          className="gap-2"
                        >
                          <Edit2 size={16} />
                          Edit
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Department Offerings */}
                  <div className="bg-white shadow-sm p-6 border rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-semibold text-lg">
                        Department Offerings
                      </h3>
                      <Button
                        size="sm"
                        onClick={() => setShowLinkForm(!showLinkForm)}
                        className="gap-2"
                      >
                        <Plus size={16} />
                        Link Department
                      </Button>
                    </div>

                    {showLinkForm && (
                      <div className="bg-gray-50 shadow-sm mb-6 p-5 border rounded-xl">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">Link to Department</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowLinkForm(false)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <LinkCourseForm
                          courseId={course.id}
                          onSuccess={() => {
                            setShowLinkForm(false);
                            fetchCourseDetails();
                          }}
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      {!course.departments ||
                      course.departments.length === 0 ? (
                        <div className="flex flex-col justify-center items-center bg-gray-50 p-8 rounded-xl text-center">
                          <p className="mb-4 text-muted-foreground">
                            This course is not yet linked to any departments.
                          </p>
                          <Button
                            size="sm"
                            onClick={() => setShowLinkForm(true)}
                            className="gap-2"
                          >
                            <Plus size={16} />
                            Link to Department
                          </Button>
                        </div>
                      ) : (
                        <div className="gap-4 grid grid-cols-1 lg:grid-cols-2">
                          {course.departments.map((dept) => (
                            <div
                              key={`${dept.departmentId}-${dept.level}`}
                              className="flex justify-between items-center bg-gray-50 p-6 border rounded-xl min-h-[100px]"
                            >
                              <div className="flex-1 pr-4">
                                <p className="font-medium text-base leading-tight break-words">
                                  {dept.department.name}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                  Level {dept.level}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <Badge
                                  variant="default"
                                  className="bg-green-100 text-green-700 border-green-200 px-3 py-1 whitespace-nowrap"
                                >
                                  linked
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 flex-shrink-0"
                                  onClick={() =>
                                    handleUnlinkClick(dept.departmentId)
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistics and Actions */}
                <div className="space-y-6 order-1 xl:order-2">
                  <div className="bg-white shadow-sm p-6 border rounded-xl">
                    <h3 className="mb-4 font-semibold text-lg">Quick Stats</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <span className="text-muted-foreground text-sm">
                          Total Departments
                        </span>
                        <span className="font-medium text-lg">
                          {course.departments?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
                        <span className="text-green-600 text-sm">
                          Active Links
                        </span>
                        <span className="font-medium text-green-600 text-lg">
                          {course.departments?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                        <span className="text-blue-600 text-sm">
                          Course Status
                        </span>
                        <span className="font-medium text-blue-600 text-lg">
                          {course.reviewStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm p-6 border rounded-xl">
                    <h3 className="mb-4 font-semibold text-lg">Actions</h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="justify-start w-full gap-2"
                        onClick={() => setShowLinkForm(true)}
                      >
                        <Plus size={16} />
                        Link to Department
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start w-full gap-2"
                        onClick={() => setShowEditForm(true)}
                      >
                        <Edit2 size={16} />
                        Edit Course Details
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start hover:bg-red-50 w-full text-red-600 hover:text-red-700 border-red-200 gap-2"
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={isDeleting}
                      >
                        <Trash2 size={16} />
                        {isDeleting ? "Deleting..." : "Delete Course"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete Course Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unlink Department Confirmation Dialog */}
      <AlertDialog
        open={showUnlinkDialog.show}
        onOpenChange={(open) =>
          setShowUnlinkDialog({ ...showUnlinkDialog, show: open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink this department from the course?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleUnlinkDepartment(showUnlinkDialog.departmentId)
              }
              className="bg-red-500 hover:bg-red-600"
            >
              Unlink
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CourseModal;
