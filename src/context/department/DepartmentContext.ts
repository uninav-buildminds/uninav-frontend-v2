import { createContext } from "react";
import { Department } from "@/lib/types/department.types";

export interface DepartmentContextType {
  departments: Record<string, Department>;
  isLoading: boolean;
  error: string | null;
  getDepartmentById: (id: string) => Department | null;
  refreshDepartments: () => Promise<void>;
}

export const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

