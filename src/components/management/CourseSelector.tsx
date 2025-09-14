import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCoursesForSelection } from "@/api/course.api";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/lib/types/course.types";
import { ResponseStatus } from "@/lib/types/response.types";

interface CourseSelectorProps {
  value: string;
  onSelect: (courseId: string) => void;
  placeholder?: string;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({
  value,
  onSelect,
  placeholder = "Search and select a course...",
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (open) {
      fetchCourses();
    }
  }, [open]);

  useEffect(() => {
    if (searchValue && open) {
      const timeoutId = setTimeout(() => {
        fetchCourses(searchValue);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchValue, open]);

  useEffect(() => {
    if (value && courses.length > 0) {
      const course = courses.find(c => c.id === value);
      setSelectedCourse(course || null);
    }
  }, [value, courses]);

  const fetchCourses = async (query?: string) => {
    try {
      setIsLoading(true);
      const response = await getCoursesForSelection(query);
      if (response?.status === ResponseStatus.SUCCESS) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course || null);
    onSelect(courseId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCourse ? (
            <span className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {selectedCourse.courseCode}
              </Badge>
              <span className="truncate">{selectedCourse.courseName}</span>
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search courses..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading courses...</span>
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {searchValue ? "No courses found." : "Start typing to search courses..."}
                </CommandEmpty>
                <CommandGroup>
                  {courses.map((course) => (
                    <CommandItem
                      key={course.id}
                      value={course.id}
                      onSelect={() => handleSelect(course.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === course.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {course.courseCode}
                        </Badge>
                        <div className="flex flex-col">
                          <span className="font-medium">{course.courseName}</span>
                          {course.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {course.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CourseSelector;