import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Users,
  Megaphone,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  School,
  UserCheck,
  ArrowLeft,
} from "lucide-react";
import { UserRole } from "@/lib/types/response.types";

// Define card data with icons and paths
const managementCards = [
  {
    title: "Materials Review",
    description: "Review and manage material submissions",
    icon: BookOpen,
    path: "/dashboard/management/materials",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    title: "Blogs Review",
    description: "Review and manage blog submissions",
    icon: FileText,
    path: "/dashboard/management/blogs",
    color: "bg-green-50 text-green-600 border-green-100",
  },
  {
    title: "Courses Review",
    description: "Review and manage course submissions",
    icon: GraduationCap,
    path: "/dashboard/management/courses",
    color: "bg-purple-50 text-purple-600 border-purple-100",
  },
  {
    title: "Course Management",
    description: "Create and link courses to departments",
    icon: School,
    path: "/dashboard/management/course-management",
    color: "bg-teal-50 text-teal-600 border-teal-100",
  },
  {
    title: "DLC Review",
    description: "Review Department Level Courses",
    icon: Award,
    path: "/dashboard/management/dlc",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    title: "Moderator Applications",
    description: "Review moderator applications",
    icon: Users,
    path: "/dashboard/management/moderators",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    adminOnly: true,
  },
  {
    title: "Adverts Review",
    description: "Review and manage advertisement submissions",
    icon: Megaphone,
    path: "/dashboard/management/adverts",
    color: "bg-rose-50 text-rose-600 border-rose-100",
  },
  {
    title: "User Management",
    description: "View and manage all users",
    icon: UserCheck,
    path: "/dashboard/management/users",
    color: "bg-sky-50 text-sky-600 border-sky-100",
    adminOnly: true,
  },
];

// Status indicators with color coding
const statusIndicators = [
  {
    name: "Pending",
    description: "Items awaiting review",
    icon: AlertTriangle,
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    name: "Approved",
    description: "Items that have been approved",
    icon: CheckCircle,
    color: "bg-green-50 text-green-600 border-green-200",
  },
  {
    name: "Rejected",
    description: "Items that have been rejected",
    icon: XCircle,
    color: "bg-red-50 text-red-600 border-red-200",
  },
];

const ManagementOverview: React.FC = () => {
  const navigate = useNavigate();
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

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToDashboard}
            className="gap-2 mb-4 p-2 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-2xl sm:text-3xl">Site Management</h1>
          <p className="text-muted-foreground">
            Manage and review content submissions across the platform.
          </p>
        </div>

        {/* Status indicators */}
        <div className="mb-8">
          <h2 className="mb-4 font-semibold text-lg sm:text-xl">Status Guide</h2>
          <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
            {statusIndicators.map((status) => (
              <div
                key={status.name}
                className={`${status.color} p-4 rounded-xl border-2 flex items-center gap-3 transition-all duration-200 hover:shadow-sm`}
              >
                <status.icon size={24} />
                <div>
                  <h3 className="font-medium">{status.name}</h3>
                  <p className="opacity-80 text-sm">{status.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Management cards grid */}
        <div className="gap-4 sm:gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {managementCards
            .filter((card) => !card.adminOnly || user.role === UserRole.ADMIN)
            .map((card) => (
              <div
                key={card.title}
                className="bg-white hover:shadow-lg border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer group"
                onClick={() => handleCardClick(card.path)}
              >
                <div className="p-6">
                  <div
                    className={`${card.color} w-12 h-12 rounded-lg mb-4 flex items-center justify-center border-2 group-hover:scale-105 transition-transform duration-200`}
                  >
                    <card.icon size={24} />
                  </div>
                  <h3 className="mb-2 font-semibold text-lg group-hover:text-brand transition-colors duration-200">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
        </div>

        {/* Role-based notes */}
        {user.role === UserRole.ADMIN && (
          <div className="bg-blue-50 p-4 border-2 border-blue-200 rounded-xl">
            <h4 className="mb-2 font-medium text-blue-700">Admin Access</h4>
            <p className="text-blue-600 text-sm leading-relaxed">
              As an administrator, you have full access to all management features
              including delete permissions and moderator application reviews.
            </p>
          </div>
        )}

        {user.role === UserRole.MODERATOR && (
          <div className="bg-green-50 p-4 border-2 border-green-200 rounded-xl">
            <h4 className="mb-2 font-medium text-green-700">Moderator Access</h4>
            <p className="text-green-600 text-sm leading-relaxed">
              As a moderator, you can approve or reject content submissions. Note
              that only administrators can delete content and review moderator
              applications.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManagementOverview;