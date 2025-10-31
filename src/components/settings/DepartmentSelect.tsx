"use client";

import React, { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAllFaculties } from "@/api/faculty.api";
import { Faculty } from "@/lib/types/faculty.types";
import { cn } from "@/lib/utils";
import { ResponseStatus } from "@/lib/types/response.types";

interface DepartmentSelectProps {
  value: string;
  onChange: (departmentId: string) => void;
  disabled?: boolean;
}

export const DepartmentSelect: React.FC<DepartmentSelectProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const departments = React.useMemo(() => {
    return faculties.flatMap((faculty) =>
      (faculty.departments || []).map((department) => ({
        id: department.id,
        name: department.name,
        facultyName: faculty.name,
        facultyId: faculty.id,
      }))
    );
  }, [faculties]);

  const selectedDepartment = React.useMemo(() => {
    return departments.find((dept) => dept.id === value);
  }, [departments, value]);

  useEffect(() => {
    const loadFaculties = async () => {
      try {
        setLoading(true);
        const response = await getAllFaculties();
        if (response?.status === ResponseStatus.SUCCESS) {
          setFaculties(response.data);
        }
      } catch (error) {
        console.error("Error loading faculties:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFaculties();
  }, []);

  const handleDepartmentSelect = (departmentId: string) => {
    onChange(departmentId);
    setOpen(false);
  };

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-md w-full h-10 animate-pulse"></div>
    );
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">Department</label>
      <div className="mt-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between w-full min-w-0"
              disabled={loading || disabled}
            >
              <span className="truncate flex-1 text-left mr-2">
                {selectedDepartment
                  ? `${selectedDepartment.name} (${selectedDepartment.facultyName})`
                  : "Select department..."}
              </span>
              <ChevronsUpDown className="opacity-50 w-4 h-4 shrink-0 flex-shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-0 w-[--radix-popover-trigger-width]"
            align="start"
          >
            <Command>
              <CommandInput placeholder="Search departments..." />
              <CommandList>
                <CommandEmpty>No department found.</CommandEmpty>
                {faculties.map((faculty) => (
                  <CommandGroup key={faculty.id} heading={faculty.name}>
                    {faculty.departments?.map((department) => (
                      <CommandItem
                        key={department.id}
                        value={`${department.name} ${faculty.name}`}
                        onSelect={() => handleDepartmentSelect(department.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedDepartment?.id === department.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {department.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
