import React from "react";
import { DepartmentProvider } from "@/context/department/DepartmentContextProvider";
import { useSidebar } from "@/hooks/useSidebar";
import ManagementSidebar from "@/components/management/ManagementSidebar";

interface ManagementLayoutProps {
  children: React.ReactNode;
}

const ManagementLayout: React.FC<ManagementLayoutProps> = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <DepartmentProvider>
      <div className="min-h-screen bg-gray-50">
        <ManagementSidebar />
        <main
          className={`transition-all duration-300 ${
            isCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          {children}
        </main>
      </div>
    </DepartmentProvider>
  );
};

export default ManagementLayout;
