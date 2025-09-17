import { getDepartments } from "@/api/department.api";
import { Department } from "@/lib/types/department.types";
import { ResponseStatus } from "@/lib/types/response.types";
import { useState, useEffect } from "react";
import { DepartmentContext, DepartmentContextType } from "./DepartmentContext";

interface DepartmentProviderProps {
  children: React.ReactNode;
}

export const DepartmentProvider: React.FC<DepartmentProviderProps> = ({ children }) => {
  const [departments, setDepartments] = useState<Record<string, Department>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getDepartments();
      
      if (response.status === ResponseStatus.SUCCESS) {
        // Convert array to key-value pairs
        const departmentMap = response.data.reduce((acc, dept) => {
          acc[dept.id] = dept;
          return acc;
        }, {} as Record<string, Department>);
        
        setDepartments(departmentMap);
      } else {
        setError(response.message || "Failed to fetch departments");
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError(err.message || "An error occurred while fetching departments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const getDepartmentById = (id: string): Department | null => {
    return departments[id] || null;
  };

  const refreshDepartments = async () => {
    await fetchDepartments();
  };

  const value: DepartmentContextType = {
    departments,
    isLoading,
    error,
    getDepartmentById,
    refreshDepartments,
  };

  return (
    <DepartmentContext.Provider value={value}>
      {children}
    </DepartmentContext.Provider>
  );
};
