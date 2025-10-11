import React from "react";
import { Outlet } from "react-router-dom";
import { DepartmentProvider } from "@/context/department/DepartmentContextProvider";
import { useSidebar } from "@/hooks/useSidebar";
import ManagementSidebar from "@/components/management/ManagementSidebar";

const ManagementLayout: React.FC = () => {
  const { isCollapsed } = useSidebar();

  return (
    <DepartmentProvider>
      <div className="flex min-h-screen bg-gray-50">
        <ManagementSidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </DepartmentProvider>
  );
};

export default ManagementLayout;
