import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  useManagementStats,
  useReviewCounts,
} from "@/hooks/useManagementStats";
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
  ArrowRight,
  BarChart3,
  Clock,
  Eye,
  Loader2,
} from "lucide-react";
import { UserRole } from "@/lib/types/response.types";

// Define quick action cards
const getQuickActions = (reviewCounts: any) => [
  {
    title: "Course Management",
    description: "Create and link courses to departments",
    icon: School,
    path: "/management/CourseManagement",
    color: "bg-teal-50 text-teal-600 border-teal-100",
    stats: "Active management",
  },
  {
    title: "Materials Review",
    description: "Review pending material submissions",
    icon: BookOpen,
    path: "/management/materials-review",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    stats: `${reviewCounts?.materials?.pending || 0} pending`,
  },
  {
    title: "Blogs Review",
    description: "Review pending blog submissions",
    icon: FileText,
    path: "/management/blogs-review",
    color: "bg-green-50 text-green-600 border-green-100",
    stats: `${reviewCounts?.blogs?.pending || 0} pending`,
  },
  {
    title: "Courses Review",
    description: "Review pending course submissions",
    icon: GraduationCap,
    path: "/management/courses-review",
    color: "bg-purple-50 text-purple-600 border-purple-100",
    stats: `${reviewCounts?.courses?.pending || 0} pending`,
  },
  {
    title: "DLC Review",
    description: "Review department level courses",
    icon: Award,
    path: "/management/dlc-review",
    color: "bg-amber-50 text-amber-600 border-amber-100",
    stats: `${reviewCounts?.dlc?.pending || 0} pending`,
  },
  {
    title: "Adverts Review",
    description: "Review pending advertisement submissions",
    icon: Megaphone,
    path: "/management/adverts-review",
    color: "bg-rose-50 text-rose-600 border-rose-100",
    stats: `${reviewCounts?.adverts?.pending || 0} pending`,
  },
  {
    title: "Moderator Applications",
    description: "Review moderator applications",
    icon: UserCheck,
    path: "/management/moderators-review",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    stats: `${reviewCounts?.moderators?.pending || 0} applications`,
    adminOnly: true,
  },
  {
    title: "User Management",
    description: "View and manage all users",
    icon: UserCheck,
    path: "/management/user-management",
    color: "bg-sky-50 text-sky-600 border-sky-100",
    stats: "1,234 users",
    adminOnly: true,
  },
];

// Status overview cards - streamlined with only useful real data
const getStatusOverview = (stats: any, reviewCounts: any) => [
  {
    name: "Pending Reviews",
    count:
      reviewCounts?.materials?.pending +
        reviewCounts?.blogs?.pending +
        reviewCounts?.courses?.pending +
        reviewCounts?.dlc?.pending +
        reviewCounts?.adverts?.pending +
        reviewCounts?.moderators?.pending || 0,
    icon: Clock,
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    name: "Approved Today",
    count: stats?.approvedToday || 0,
    icon: CheckCircle,
    color: "bg-green-50 text-green-600 border-green-200",
  },
  {
    name: "Rejected Items",
    count: stats?.rejectedItems || 0,
    icon: XCircle,
    color: "bg-red-50 text-red-600 border-red-200",
  },
];

const ManagementDashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useManagementStats();
  const {
    data: reviewCounts,
    isLoading: reviewLoading,
    error: reviewError,
  } = useReviewCounts();

  const handleQuickActionClick = (path: string) => {
    navigate(path);
  };

  const isLoading = statsLoading || reviewLoading;
  const quickActions = getQuickActions(reviewCounts?.data);
  const statusOverview = getStatusOverview(stats?.data, reviewCounts?.data);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading dashboard data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Status Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusOverview.map((stat) => (
            <div
              key={stat.name}
              className={`${stat.color} p-4 rounded-lg border transition-all duration-200 hover:shadow-sm`}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon size={20} />
                <span className="text-xl font-bold">{stat.count}</span>
              </div>
              <h3 className="font-medium text-sm">{stat.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <Button variant="ghost" size="sm" className="gap-2">
            <BarChart3 size={16} />
            View Analytics
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions
            .filter(
              (action) => !action.adminOnly || user?.role === UserRole.ADMIN
            )
            .map((action) => (
              <div
                key={action.title}
                className="bg-white border rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => handleQuickActionClick(action.path)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center border-2 group-hover:scale-105 transition-transform duration-200`}
                  >
                    <action.icon size={24} />
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200"
                  />
                </div>

                <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors duration-200">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                  {action.description}
                </p>
                <div className="text-xs text-gray-500 font-medium">
                  {action.stats}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Role-based Information */}
      {user?.role === UserRole.ADMIN && (
        <div className="bg-blue-50 p-6 border-2 border-blue-200 rounded-xl">
          <h4 className="font-medium text-blue-700 mb-2">
            Administrator Dashboard
          </h4>
          <p className="text-blue-600 text-sm leading-relaxed">
            You have full administrative access including user management,
            moderator reviews, and content deletion permissions. Use the sidebar
            to navigate to specific management areas.
          </p>
        </div>
      )}

      {user?.role === UserRole.MODERATOR && (
        <div className="bg-green-50 p-6 border-2 border-green-200 rounded-xl">
          <h4 className="font-medium text-green-700 mb-2">
            Moderator Dashboard
          </h4>
          <p className="text-green-600 text-sm leading-relaxed">
            As a moderator, you can review and approve content submissions.
            Contact an administrator if you need additional permissions or have
            questions.
          </p>
        </div>
      )}
    </div>
  );
};

const ManagementDashboard: React.FC = () => {
  return <ManagementDashboardContent />;
};

export default ManagementDashboard;
