import React, { useEffect, useState } from "react";
import { SelectModal, SelectOption } from "./SearchSelectModal";
import { cn } from "@/lib/utils";
import { Course } from "@/lib/types/course.types";
import { getCourses } from "@/api/course.api";
import { toast } from "sonner";

interface SelectCourseModalProps {
  value?: string;
  onChange: (courseId: string, course?: Course) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  departmentId?: string;
  level?: number;
  allowDepartments?: boolean;
  limit?: number;
}

export const SelectCourseModal: React.FC<SelectCourseModalProps> = ({
  value = "",
  onChange,
  placeholder = "Search and select a course...",
  disabled = false,
  className = "",
  label,
  error,
  departmentId,
  level,
  allowDepartments = true,
  limit = 50,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Convert courses to SelectOption format
  const courseOptions: SelectOption[] = courses.map((course) => ({
    value: course.id,
    label: `${course.courseCode}: ${course.courseName}`,
    description: course.description,
    metadata: course,
  }));

  // Fetch courses function
  const fetchCourses = async (searchQuery?: string) => {
    try {
      setLoading(true);
      const filters = {
        query: searchQuery || undefined,
        departmentId,
        level,
        allowDepartments,
        limit,
      };

      const response = await getCourses(filters);
      if (response && "data" in response) {
        setCourses(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching courses:", error.message);
      toast.error("Failed to fetch courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCourses();
  }, [departmentId, level, allowDepartments, limit]);

  // Custom render function for course options
  const renderCourseOption = (
    option: SelectOption,
    active: boolean,
    selected: boolean
  ) => {
    const course = option.metadata as Course;
    return (
      <div className="flex flex-col">
        <span
          className={cn(
            "block truncate text-sm",
            selected ? "font-medium" : "font-normal"
          )}
        >
          {option.label}
        </span>
        {course.description && (
          <span
            className={cn(
              "block truncate text-xs mt-0.5",
              active ? "text-white/80" : "text-gray-500"
            )}
          >
            {course.description}
          </span>
        )}
        {course.departments && course.departments.length > 0 && (
          <div className="flex items-center space-x-1 mt-1">
            {course.departments.slice(0, 2).map((dept) => (
              <span
                key={dept.departmentId}
                className={cn(
                  "inline-flex items-center px-1.5 py-0.5 rounded text-xs",
                  active ? "bg-white/20 text-white" : "bg-brand/10 text-brand"
                )}
              >
                {dept.department.name} L{dept.level}
              </span>
            ))}
            {course.departments.length > 2 && (
              <span
                className={cn(
                  "text-xs",
                  active ? "text-white/80" : "text-gray-500"
                )}
              >
                +{course.departments.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  // Handle selection change
  const handleChange = (courseId: string, selectedOption?: SelectOption) => {
    const course = selectedOption?.metadata as Course | undefined;
    onChange(courseId, course);
  };

  return (
    <SelectModal
      value={value}
      onChange={handleChange}
      options={courseOptions}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      label={label}
      error={error}
      loading={loading}
      searchable={true}
      onSearch={fetchCourses}
      emptyMessage="No courses available"
      renderOption={renderCourseOption}
    />
  );
};

export default SelectCourseModal;
