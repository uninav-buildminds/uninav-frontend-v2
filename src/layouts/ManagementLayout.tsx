import React from "react";
import { DepartmentProvider } from "@/context/department/DepartmentContextProvider";
import ManagementSidebar from "@/components/management/ManagementSidebar";

interface ManagementLayoutProps {
  children: React.ReactNode;
}

const ManagementLayout: React.FC<ManagementLayoutProps> = ({ children }) => {
  return (
    <DepartmentProvider>
      <div className="flex min-h-screen bg-gray-50">
        <ManagementSidebar />
        <main className="flex-1 ml-64">{children}</main>
      </div>
    </DepartmentProvider>
  );
};

export default ManagementLayout;
