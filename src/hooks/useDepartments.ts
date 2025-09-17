import { DepartmentContext } from "@/context/department/DepartmentContext";
import { useContext } from "react";

export const useDepartments = () => {
  const context = useContext(DepartmentContext);
  if (context === undefined) {
    throw new Error("useDepartments must be used within a DepartmentProvider");
  }
  return context;
};