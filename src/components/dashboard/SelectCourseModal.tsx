import React, { useEffect, useState, useCallback } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  Transition,
} from "@headlessui/react";
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
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const selectedCourse = courses.find((course) => course.id === value);

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      const timeout = setTimeout(async () => {
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
          setCourses(response.data);
        } catch (error: any) {
          console.error("Error fetching courses:", error.message);
          toast.error("Failed to fetch courses");
          setCourses([]);
        } finally {
          setLoading(false);
        }
      }, 300); // 300ms debounce

      setSearchTimeout(timeout);
    },
    [departmentId, level, allowDepartments, limit, searchTimeout]
  );

  // Initial fetch
  useEffect(() => {
    const fetchInitialCourses = async () => {
      try {
        setLoading(true);
        const filters = {
          departmentId,
          level,
          allowDepartments,
          limit,
        };

        const response = await getCourses(filters);
        setCourses(response.data);
      } catch (error: any) {
        console.error("Error fetching initial courses:", error.message);
        toast.error("Failed to fetch courses");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialCourses();
  }, [departmentId, level, allowDepartments, limit]);

  // Handle search input changes
  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const filteredCourses = courses.filter((course) => {
    if (!query) return true;
    const searchTerm = query.toLowerCase();
    return (
      course.courseName.toLowerCase().includes(searchTerm) ||
      course.courseCode.toLowerCase().includes(searchTerm) ||
      (course.description &&
        course.description.toLowerCase().includes(searchTerm))
    );
  });

  const getDisplayValue = () => {
    if (loading && !selectedCourse) return "Loading courses...";
    if (selectedCourse) {
      return `${selectedCourse.courseCode}: ${selectedCourse.courseName}`;
    }
    return "";
  };

  const handleSelectionChange = (courseId: string) => {
    const selectedCourse = courses.find((course) => course.id === courseId);
    onChange(courseId, selectedCourse);
  };

  return (
    <div className={cn("relative w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <Combobox
        value={value}
        onChange={handleSelectionChange}
        onClose={() => setQuery("")}
        disabled={disabled}
      >
        {({ open }) => (
          <div className="relative">
            <div className="relative w-full">
              <ComboboxInput
                className={cn(
                  "w-full py-2 pl-3 pr-10 text-sm leading-5 bg-background border rounded-lg transition-colors duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand",
                  disabled
                    ? "cursor-not-allowed opacity-50 bg-gray-50"
                    : "cursor-text",
                  error
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "border-input hover:border-gray-400",
                  "placeholder:text-muted-foreground"
                )}
                displayValue={getDisplayValue}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholder}
                disabled={disabled}
              />
              <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>
                ) : (
                  <ChevronsUpDown
                    className={cn(
                      "h-4 w-4 transition-colors duration-200",
                      disabled ? "text-gray-400" : "text-gray-500"
                    )}
                    aria-hidden="true"
                  />
                )}
              </ComboboxButton>
            </div>

            <Transition
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 border border-input focus:outline-none sm:text-sm">
                {loading && courses.length === 0 ? (
                  <div className="relative cursor-default select-none py-3 px-4 text-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>
                      <span>Searching courses...</span>
                    </div>
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="relative cursor-default select-none py-3 px-4">
                    <div className="flex flex-col items-center space-y-2 text-gray-500">
                      <Search className="h-8 w-8 text-gray-300" />
                      <div className="text-center">
                        <p className="text-sm font-medium">No courses found</p>
                        <p className="text-xs">
                          {query
                            ? `No courses match "${query}"`
                            : "No courses available"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {query && (
                      <div className="relative px-4 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
                        {filteredCourses.length} course
                        {filteredCourses.length !== 1 ? "s" : ""} found
                      </div>
                    )}
                    {filteredCourses.map((course) => (
                      <ComboboxOption
                        key={course.id}
                        value={course.id}
                        className={({ active }) =>
                          cn(
                            "relative cursor-default select-none py-2 pl-10 pr-4 transition-colors duration-150",
                            active
                              ? "bg-brand text-white"
                              : "text-foreground hover:bg-gray-100"
                          )
                        }
                      >
                        {({ selected, active }) => (
                          <>
                            <div className="flex flex-col">
                              <span
                                className={cn(
                                  "block truncate text-sm",
                                  selected ? "font-medium" : "font-normal"
                                )}
                              >
                                {course.courseCode}: {course.courseName}
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
                              {course.departments &&
                                course.departments.length > 0 && (
                                  <div className="flex items-center space-x-1 mt-1">
                                    {course.departments
                                      .slice(0, 2)
                                      .map((dept, index) => (
                                        <span
                                          key={dept.departmentId}
                                          className={cn(
                                            "inline-flex items-center px-1.5 py-0.5 rounded text-xs",
                                            active
                                              ? "bg-white/20 text-white"
                                              : "bg-brand/10 text-brand"
                                          )}
                                        >
                                          {dept.department.name} L{dept.level}
                                        </span>
                                      ))}
                                    {course.departments.length > 2 && (
                                      <span
                                        className={cn(
                                          "text-xs",
                                          active
                                            ? "text-white/80"
                                            : "text-gray-500"
                                        )}
                                      >
                                        +{course.departments.length - 2} more
                                      </span>
                                    )}
                                  </div>
                                )}
                            </div>
                            {selected && (
                              <span
                                className={cn(
                                  "absolute inset-y-0 left-0 flex items-center pl-3",
                                  active ? "text-white" : "text-brand"
                                )}
                              >
                                <Check className="h-4 w-4" aria-hidden="true" />
                              </span>
                            )}
                          </>
                        )}
                      </ComboboxOption>
                    ))}
                  </>
                )}
              </ComboboxOptions>
            </Transition>
          </div>
        )}
      </Combobox>

      {error && (
        <p className="mt-1 text-sm text-red-600" id="error">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectCourseModal;
