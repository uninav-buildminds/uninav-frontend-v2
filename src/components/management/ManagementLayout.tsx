import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/lib/types/response.types";
import ManagementSidebar from "@/components/management/ManagementSidebar";

const ManagementLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Redirect if not admin or moderator
  useEffect(() => {
    if (user && user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // If user not loaded yet or not admin/moderator, show loading or nothing
  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR)) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Management Sidebar */}
      <ManagementSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Management Dashboard</h1>
              <p className="text-sm text-gray-600">
                Manage and review content across the platform
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Logged in as: <span className="font-medium text-gray-900">{user.firstName} {user.lastName}</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {user.role.toLowerCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagementLayout;