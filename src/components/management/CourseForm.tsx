import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus } from "lucide-react";
import { 
  CreateCourseRequest, 
  LinkCourseRequest, 
  createCourse, 
  linkCourseToDepartment 
} from "@/api/course.api";
import { useToast } from "@/hooks/use-toast";
import DepartmentSelector from "./DepartmentSelector";
import CourseSelector from "./CourseSelector";
import { ResponseStatus } from "@/lib/types/response.types";

// Link Course Form Props
export interface LinkCourseFormProps {
  courseId?: string; // Optional for when we already have a course ID
  onSuccess: () => void;
}

// Link Course Form component for linking an existing course to a department
export const LinkCourseForm: React.FC<LinkCourseFormProps> = ({
  courseId: initialCourseId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    courseId: initialCourseId || "",
    departmentId: "",
    level: 100,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDepartmentSelect = (departmentId: string) => {
    setFormData((prev) => ({ ...prev, departmentId }));
  };

  const handleCourseSelect = (courseId: string) => {
    setFormData((prev) => ({ ...prev, courseId }));
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, level: Number(e.target.value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.courseId) {
      setError("Please select a course");
      return;
    }

    if (!formData.departmentId) {
      setError("Department selection is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const linkData: LinkCourseRequest = {
        courseId: formData.courseId,
        departmentId: formData.departmentId,
        level: formData.level,
      };

      const response = await linkCourseToDepartment(linkData);

      if (response?.status === ResponseStatus.SUCCESS) {
        toast({
          title: "Success",
          description: "Course linked to department successfully",
        });
        onSuccess();
      } else {
        setError("Failed to link course to department. Please try again.");
      }
    } catch (err: any) {
      console.error("Error linking course:", err);
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-3 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Only show course selection if no courseId was provided */}
      {!initialCourseId && (
        <div className="space-y-2">
          <Label htmlFor="courseId">Select Course</Label>
          <CourseSelector
            value={formData.courseId}
            onSelect={handleCourseSelect}
            placeholder="Search and select a course..."
          />
        </div>
      )}

      {/* Department and Level selection */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="departmentId">Department</Label>
          <DepartmentSelector
            value={formData.departmentId}
            onSelect={handleDepartmentSelect}
            placeholder="Select department..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <select
            id="level"
            value={formData.level}
            onChange={handleLevelChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value={100}>100 Level</option>
            <option value={200}>200 Level</option>
            <option value={300}>300 Level</option>
            <option value={400}>400 Level</option>
            <option value={500}>500 Level</option>
            <option value={600}>600 Level</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Linking Course...
            </>
          ) : (
            <>
              <Plus size={16} />
              Link Course to Department
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

// Course form props
interface CourseFormProps {
  onSuccess: () => void;
}

// Course form data type
interface CourseFormData {
  courseId: string; // Used for existing course selection
  courseName: string;
  courseCode: string;
  description: string;
  departmentId: string;
  level: number;
  useExistingCourse: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<CourseFormData>({
    courseId: "",
    courseName: "",
    courseCode: "",
    description: "",
    departmentId: "",
    level: 100,
    useExistingCourse: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "courseCode") {
      // Remove spaces from course code
      const cleanedValue = value.replace(/\s+/g, "");
      if (value !== cleanedValue) {
        toast({
          title: "Invalid Input",
          description: "Course code cannot contain spaces. Spaces have been removed.",
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
      setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDepartmentSelect = (departmentId: string) => {
    setFormData((prev) => ({ ...prev, departmentId }));
  };

  const handleCourseSelect = (courseId: string) => {
    setFormData((prev) => ({ ...prev, courseId }));
  };

  const toggleCourseMode = () => {
    setFormData((prev) => ({
      ...prev,
      useExistingCourse: !prev.useExistingCourse,
      // Reset relevant fields
      courseId: "",
      courseName: "",
      courseCode: "",
      description: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.useExistingCourse && !formData.courseId) {
      setError("Please select an existing course");
      return;
    }

    if (!formData.useExistingCourse) {
      if (!formData.courseName.trim()) {
        setError("Course name is required");
        return;
      }
      if (!formData.courseCode.trim()) {
        setError("Course code is required");
        return;
      }
    }

    if (!formData.departmentId) {
      setError("Department selection is required");
      return;
    }

    try {
      setIsSubmitting(true);

      if (formData.useExistingCourse) {
        // Link existing course to department
        const linkData: LinkCourseRequest = {
          courseId: formData.courseId,
          departmentId: formData.departmentId,
          level: formData.level,
        };

        const response = await linkCourseToDepartment(linkData);

        if (response?.status === ResponseStatus.SUCCESS) {
          toast({
            title: "Success",
            description: "Course linked to department successfully",
          });
          onSuccess();
        } else {
          setError("Failed to link course to department. Please try again.");
        }
      } else {
        // Create a new course
        const courseData: CreateCourseRequest = {
          courseName: formData.courseName,
          courseCode: formData.courseCode,
          description: formData.description,
          departmentId: formData.departmentId,
          level: formData.level,
        };

        const response = await createCourse(courseData);

        if (response?.status === ResponseStatus.SUCCESS) {
          toast({
            title: "Success",
            description: "Course created successfully",
          });
          onSuccess();
        } else {
          setError("Failed to create course. Please try again.");
        }
      }
    } catch (err: any) {
      console.error("Error creating/linking course:", err);
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Toggle between existing/new course */}
      <div className="flex md:flex-row flex-col items-center gap-4 mb-6">
        <Badge
          variant={formData.useExistingCourse ? "default" : "secondary"}
          className="text-sm"
        >
          Link Existing Course
        </Badge>
        <div className="flex items-center">
          <button
            type="button"
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
              formData.useExistingCourse ? "bg-brand" : "bg-gray-300"
            }`}
            onClick={toggleCourseMode}
          >
            <div
              className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform duration-200 ease-in-out ${
                formData.useExistingCourse ? "translate-x-6" : "translate-x-0.5"
              }`}
            ></div>
          </button>
        </div>
        <Badge
          variant={!formData.useExistingCourse ? "default" : "secondary"}
          className="text-sm"
        >
          Create New Course
        </Badge>
      </div>

      {error && (
        <div className="bg-red-50 p-3 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Course selection or creation */}
      {formData.useExistingCourse ? (
        <div className="space-y-2">
          <Label htmlFor="courseId">Select Existing Course</Label>
          <CourseSelector
            value={formData.courseId}
            onSelect={handleCourseSelect}
            placeholder="Search and select a course..."
          />
        </div>
      ) : (
        <>
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="courseName">Course Name</Label>
              <Input
                id="courseName"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                placeholder="e.g., Introduction to Computer Science"
                required={!formData.useExistingCourse}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseCode">Course Code</Label>
              <Input
                id="courseCode"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleChange}
                placeholder="e.g., CS101"
                required={!formData.useExistingCourse}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Course Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the course"
              rows={3}
            />
          </div>
        </>
      )}

      {/* Department and Level selection - required for both modes */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="departmentId">Department</Label>
          <DepartmentSelector
            value={formData.departmentId}
            onSelect={handleDepartmentSelect}
            placeholder="Select department..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <select
            id="level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value={100}>100 Level</option>
            <option value={200}>200 Level</option>
            <option value={300}>300 Level</option>
            <option value={400}>400 Level</option>
            <option value={500}>500 Level</option>
            <option value={600}>600 Level</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {formData.useExistingCourse ? "Linking Course..." : "Creating Course..."}
            </>
          ) : (
            <>
              <Plus size={16} />
              {formData.useExistingCourse ? "Link Course" : "Create Course"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CourseForm;