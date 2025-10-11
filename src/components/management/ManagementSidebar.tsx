import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/hooks/useSidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Users,
  Megaphone,
  Award,
  School,
  UserCheck,
  ArrowLeft,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { UserRole } from "@/lib/types/response.types";
// import LogoIcon from "/assets/logo.svg";

// Define navigation items
const navigationItems = [
  {
    title: "Overview",
    path: "/management",
    icon: LayoutDashboard,
    description: "Management dashboard overview",
  },
  {
    title: "Course Management",
    path: "/management/courses",
    icon: School,
    description: "Create and link courses to departments",
  },
  {
    title: "User Management",
    path: "/management/user-management",
    icon: UserCheck,
    description: "View and manage all users",
    adminOnly: true,
  },
  {
    title: "Courses Review",
    path: "/management/courses-review",
    icon: GraduationCap,
    description: "Review course submissions",
  },
  {
    title: "DLC Review",
    path: "/management/dlc-review",
    icon: Award,
    description: "Review department level courses",
  },
  {
    title: "Materials Review",
    path: "/management/materials-review",
    icon: BookOpen,
    description: "Review and manage material submissions",
  },
  {
    title: "Blogs Review",
    path: "/management/blogs-review",
    icon: FileText,
    description: "Review and manage blog submissions",
  },
  // {
  //   title: "Adverts Review",
  //   path: "/management/adverts",
  //   icon: Megaphone,
  //   description: "Review and manage advertisement submissions",
  // },
  // {
  //   title: "Moderator Applications",
  //   path: "/management/moderators",
  //   icon: Users,
  //   description: "Review moderator applications",
  //   adminOnly: true,
  // },
];

const ManagementSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter(
    (item) => !item.adminOnly || user?.role === UserRole.ADMIN
  );

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div
        className={cn("border-b border-gray-200", isCollapsed ? "p-3" : "p-6")}
      >
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center mb-3" : "justify-between mb-4"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity",
              isCollapsed ? "justify-center" : ""
            )}
            onClick={handleLogoClick}
          >
            <img
              src="/assets/logo.svg"
              alt="UniNav Logo"
              className={cn("w-8 h-8", isCollapsed ? "w-10 h-10" : "")}
            />
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-lg text-gray-900">UniNav</h2>
                <p className="text-xs text-gray-500">Management Portal</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapse}
              className="p-1 h-8 w-8"
            >
              <ChevronLeft size={16} />
            </Button>
          )}
        </div>

        {/* Navigation buttons */}
        {!isCollapsed && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={handleBackToDashboard}
              className="w-full justify-start gap-2 text-sm"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-1", isCollapsed ? "p-2" : "p-4")}>
        {!isCollapsed && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Management
            </h3>
          </div>
        )}

        {filteredNavigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/management"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                isActive
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                isCollapsed ? "justify-center px-2 py-3" : ""
              )
            }
            title={isCollapsed ? item.title : undefined}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={isCollapsed ? 20 : 16}
                  className={cn(
                    "transition-colors",
                    isActive
                      ? "text-blue-700"
                      : "text-gray-500 group-hover:text-gray-700"
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.title}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200">
        {isCollapsed ? (
          <div className="p-2 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapse}
              className="p-1 h-8 w-8"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        ) : (
          <div className="p-4">
            <div className="text-xs text-gray-500">
              <p className="font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="capitalize">{user?.role.toLowerCase()} Access</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagementSidebar;
