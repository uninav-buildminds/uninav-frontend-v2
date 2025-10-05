import React, { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Course } from "@/lib/types/response.type";
import { getCourses } from "@/api/course.api";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";

type Props = {
  onChange: (value: string) => void;
  currentValue?: string;
  label?: string;
  className?: string;
};

export const SelectCourse = ({
  onChange,
  currentValue,
  label,
  className,
}: Props) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState("");
  const [value, setValue] = useState(currentValue || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await getCourses();
        setCourses(res.data);
      } catch (err: any) {
        console.error("Error fetching courses", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Update value when currentValue prop changes
  useEffect(() => {
    if (currentValue) {
      setValue(currentValue);
    }
  }, [currentValue]);

  const selectedCourse = courses.find((course) => course.id === value);

  const filteredCourses =
    query === ""
      ? courses
      : courses.filter((course) =>
          `${course.courseCode} ${course.courseName}`
            .toLowerCase()
            .includes(query.toLowerCase())
        );

  return (
    <div className={cn("relative w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <Combobox
        value={value}
        onChange={(newValue) => {
          // Handle null values by defaulting to empty string
          const selectedValue = newValue || "";
          setValue(selectedValue);
          onChange(selectedValue);
        }}
        onClose={() => setQuery("")}
      >
        <div className="relative w-full">
          <div className="flex items-center w-full">
            <ComboboxInput
              className="w-full py-2 pl-3 pr-10 text-sm leading-5 bg-background border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              displayValue={() => {
                if (loading) return "Loading courses...";
                if (selectedCourse)
                  return `${selectedCourse.courseCode}: ${selectedCourse.courseName}`;
                return "";
              }}
              onChange={(event) => setQuery(event.target.value)}
              disabled={loading}
              placeholder="Select course..."
            />
            <ComboboxButton className="right-0 absolute inset-y-0 flex items-center pr-2">
              <ChevronsUpDown className="opacity-50 w-4 h-4 shrink-0" />
            </ComboboxButton>
          </div>
          <ComboboxOptions className="z-[1070] absolute bg-background ring-opacity-5 shadow-lg mt-1 py-1 border border-gray-300 rounded-md focus:outline-none ring-1 ring-black w-full max-h-60 overflow-auto sm:text-sm text-base">
            {loading ? (
              <div className="relative px-4 py-2 text-gray-700 cursor-default select-none">
                Loading courses...
              </div>
            ) : filteredCourses.length === 0 && query !== "" ? (
              <div className="relative px-4 py-2 text-gray-700 cursor-default select-none">
                No course found.
              </div>
            ) : (
              filteredCourses.map((course) => (
                <ComboboxOption
                  key={course.id}
                  value={course.id}
                  className={({ active }) =>
                    cn(
                      "relative cursor-default select-none py-2 pl-10 pr-4",
                      active
                        ? "bg-brand text-white"
                        : "text-foreground hover:bg-gray-100"
                    )
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={cn(
                          "block truncate",
                          selected ? "font-medium" : "font-normal"
                        )}
                      >
                        {course.courseCode}: {course.courseName}
                      </span>
                      {selected ? (
                        <span
                          className={cn(
                            "absolute inset-y-0 left-0 flex items-center pl-3",
                            active ? "text-white" : "text-brand"
                          )}
                        >
                          <Check className="w-4 h-4" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </div>
      </Combobox>
    </div>
  );
};
