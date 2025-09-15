import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/lib/types/response.types";
import ManagementSidebar from "@/components/management/ManagementSidebar";
import { Loader2 } from "lucide-react";

const ManagementLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, isValidating, authInitializing } = useAuth() as any;

  // Redirect if authenticated but not authorized
  useEffect(() => {
    if (user && user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Show loading state while auth/user info is being resolved
  if (authInitializing || isLoading || isValidating || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading management portal...</p>
        </div>
      </div>
    );
  }

  // Safety check (should have navigated already if unauthorized)
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) return null;

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