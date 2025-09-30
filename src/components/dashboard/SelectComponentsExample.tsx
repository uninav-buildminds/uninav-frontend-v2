import React, { useState } from "react";
import { SelectModal, SelectOption } from "./SelectModal";
import { SelectCourseModal } from "./SelectCourseModal";
import { Course } from "@/lib/types/course.types";

/**
 * Example component demonstrating the usage of SelectModal and SelectCourseModal
 * This file can be removed after implementation - it's just for reference
 */
export const SelectComponentsExample: React.FC = () => {
  const [selectedGeneric, setSelectedGeneric] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedCourseData, setSelectedCourseData] = useState<
    Course | undefined
  >();

  // Example options for generic select
  const genericOptions: SelectOption[] = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
    { value: "option4", label: "Option 4 (Disabled)", disabled: true },
  ];

  const handleCourseChange = (courseId: string, course?: Course) => {
    setSelectedCourse(courseId);
    setSelectedCourseData(course);
  };

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-6">Select Components Examples</h2>

        {/* Generic SelectModal Examples */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Generic SelectModal</h3>

            {/* Basic Select */}
            <div className="space-y-4">
              <SelectModal
                label="Basic Select"
                value={selectedGeneric}
                onChange={setSelectedGeneric}
                options={genericOptions}
                placeholder="Choose an option..."
              />
              {selectedGeneric && (
                <p className="text-sm text-gray-600">
                  Selected:{" "}
                  {
                    genericOptions.find((opt) => opt.value === selectedGeneric)
                      ?.label
                  }
                </p>
              )}
            </div>

            {/* Searchable Select */}
            <div className="space-y-4">
              <SelectModal
                label="Searchable Select"
                value={selectedGeneric}
                onChange={setSelectedGeneric}
                options={genericOptions}
                placeholder="Search options..."
                searchable
                emptyMessage="No matching options found."
              />
            </div>

            {/* Disabled Select */}
            <div className="space-y-4">
              <SelectModal
                label="Disabled Select"
                value=""
                onChange={() => {}}
                options={genericOptions}
                placeholder="This is disabled"
                disabled
              />
            </div>

            {/* Select with Error */}
            <div className="space-y-4">
              <SelectModal
                label="Select with Error"
                value=""
                onChange={setSelectedGeneric}
                options={genericOptions}
                placeholder="This has an error"
                error="Please select an option"
              />
            </div>
          </div>

          {/* Course SelectModal Examples */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Course SelectModal</h3>

            {/* Basic Course Select */}
            <div className="space-y-4">
              <SelectCourseModal
                label="Select Course"
                value={selectedCourse}
                onChange={handleCourseChange}
                placeholder="Search for a course..."
              />
              {selectedCourseData && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">
                    <strong>Selected Course:</strong>{" "}
                    {selectedCourseData.courseCode} -{" "}
                    {selectedCourseData.courseName}
                  </p>
                  {selectedCourseData.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Description:</strong>{" "}
                      {selectedCourseData.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Course Select with Department Filter */}
            <div className="space-y-4">
              <SelectCourseModal
                label="Courses (Department Filtered)"
                value=""
                onChange={(id, course) =>
                  console.log("Department filtered:", { id, course })
                }
                placeholder="Search courses in specific department..."
                departmentId="some-department-id" // Replace with actual department ID
                level={100}
              />
            </div>

            {/* Course Select with Error */}
            <div className="space-y-4">
              <SelectCourseModal
                label="Course Select with Error"
                value=""
                onChange={handleCourseChange}
                placeholder="Select a course"
                error="Course selection is required"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectComponentsExample;
