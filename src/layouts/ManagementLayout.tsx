import React from "react";
import { DepartmentProvider } from "@/context/department/DepartmentContextProvider";

interface ManagementLayoutProps {
  children: React.ReactNode;
}

const ManagementLayout: React.FC<ManagementLayoutProps> = ({ children }) => {
  return (
    <DepartmentProvider>
      {children}
    </DepartmentProvider>
  );
};

export default ManagementLayout;
