import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFaculties } from "@/api/course.api";
import { Loader2 } from "lucide-react";
import { Department } from "@/lib/types/department.types";
import { Faculty } from "@/lib/types/faculty.types";
import { ResponseStatus } from "@/lib/types/response.types";

interface DepartmentSelectorProps {
  value: string;
  onSelect: (departmentId: string) => void;
  placeholder?: string;
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  value,
  onSelect,
  placeholder = "Select department...",
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  useEffect(() => {
    fetchFaculties();
  }, []);

  useEffect(() => {
    if (value && departments.length > 0) {
      const dept = departments.find(d => d.id === value);
      setSelectedDepartment(dept || null);
    }
  }, [value, departments]);

  const fetchFaculties = async () => {
    try {
      setIsLoading(true);
      const response = await getFaculties();
      if (response?.status === ResponseStatus.SUCCESS) {
        setFaculties(response.data);
        
        // Collect all departments from all faculties
        const allDepartments: Department[] = [];
        response.data.forEach((faculty: Faculty) => {
          if (faculty.departments) {
            faculty.departments.forEach(dept => {
              allDepartments.push({
                ...dept,
                faculty: { id: faculty.id, name: faculty.name }
              });
            });
          }
        });
        setDepartments(allDepartments);
      }
    } catch (error) {
      console.error("Error fetching faculties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    dept.faculty?.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (departmentId: string) => {
    const dept = departments.find(d => d.id === departmentId);
    setSelectedDepartment(dept || null);
    onSelect(departmentId);
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
          {selectedDepartment ? (
            <span className="flex items-center gap-2">
              <span className="truncate">{selectedDepartment.name}</span>
              {selectedDepartment.faculty && (
                <span className="text-xs text-muted-foreground truncate">
                  ({selectedDepartment.faculty.name})
                </span>
              )}
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
            placeholder="Search departments..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading departments...</span>
              </div>
            ) : (
              <>
                <CommandEmpty>No departments found.</CommandEmpty>
                <CommandGroup>
                  {filteredDepartments.map((dept) => (
                    <CommandItem
                      key={dept.id}
                      value={dept.id}
                      onSelect={() => handleSelect(dept.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === dept.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{dept.name}</span>
                        {dept.faculty && (
                          <span className="text-xs text-muted-foreground">
                            {dept.faculty.name}
                          </span>
                        )}
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

export default DepartmentSelector;