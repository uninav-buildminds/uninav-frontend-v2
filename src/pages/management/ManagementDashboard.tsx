import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
} from "lucide-react";
import { UserRole } from "@/lib/types/response.types";

// Define quick action cards
const quickActions = [
  {
    title: "Course Management",
    description: "Create and link courses to departments",
    icon: School,
    path: "/management/courses",
    color: "bg-teal-50 text-teal-600 border-teal-100",
    stats: "Active management",
  },
  {
    title: "Materials Review",
    description: "Review pending material submissions",
    icon: BookOpen,
    path: "/management/materials",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    stats: "12 pending",
  },
  {
    title: "Blogs Review",
    description: "Review pending blog submissions",
    icon: FileText,
    path: "/management/blogs",
    color: "bg-green-50 text-green-600 border-green-100",
    stats: "5 pending",
  },
  {
    title: "User Management",
    description: "View and manage all users",
    icon: UserCheck,
    path: "/management/users",
    color: "bg-sky-50 text-sky-600 border-sky-100",
    stats: "1,234 users",
    adminOnly: true,
  },
];

// Status overview cards
const statusOverview = [
  {
    name: "Pending Reviews",
    count: 24,
    icon: Clock,
    color: "bg-amber-50 text-amber-600 border-amber-200",
    change: "+3 today",
  },
  {
    name: "Approved Today",
    count: 18,
    icon: CheckCircle,
    color: "bg-green-50 text-green-600 border-green-200",
    change: "+12 vs yesterday",
  },
  {
    name: "Rejected Items",
    count: 7,
    icon: XCircle,
    color: "bg-red-50 text-red-600 border-red-200",
    change: "-2 vs yesterday",
  },
  {
    name: "Total Views",
    count: "12.4k",
    icon: Eye,
    color: "bg-blue-50 text-blue-600 border-blue-200",
    change: "+15% this week",
  },
];

const ManagementDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleQuickActionClick = (path: string) => {
    navigate(path);
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusOverview.map((stat) => (
            <div
              key={stat.name}
              className={`${stat.color} p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-sm`}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon size={24} />
                <span className="text-2xl font-bold">{stat.count}</span>
              </div>
              <h3 className="font-medium mb-1">{stat.name}</h3>
              <p className="text-sm opacity-80">{stat.change}</p>
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
            .filter((action) => !action.adminOnly || user?.role === UserRole.ADMIN)
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

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white border rounded-xl p-6">
          <div className="space-y-4">
            {[
              {
                action: "Material approved",
                item: "Advanced React Concepts",
                user: "John Doe",
                time: "2 hours ago",
                status: "approved",
              },
              {
                action: "Course linked",
                item: "CS101 to Computer Science Department",
                user: "You",
                time: "4 hours ago",
                status: "created",
              },
              {
                action: "Blog rejected",
                item: "10 Tips for Better Code",
                user: "Jane Smith",
                time: "6 hours ago",
                status: "rejected",
              },
              {
                action: "User registered",
                item: "New moderator application",
                user: "Mike Johnson",
                time: "1 day ago",
                status: "pending",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.status === 'approved' ? 'bg-green-100' :
                    activity.status === 'rejected' ? 'bg-red-100' :
                    activity.status === 'created' ? 'bg-blue-100' :
                    'bg-amber-100'
                  }`}>
                    {activity.status === 'approved' && <CheckCircle size={14} className="text-green-600" />}
                    {activity.status === 'rejected' && <XCircle size={14} className="text-red-600" />}
                    {activity.status === 'created' && <CheckCircle size={14} className="text-blue-600" />}
                    {activity.status === 'pending' && <AlertTriangle size={14} className="text-amber-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      <span className="capitalize">{activity.action}</span>: {activity.item}
                    </p>
                    <p className="text-xs text-gray-500">by {activity.user}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role-based Information */}
      {user?.role === UserRole.ADMIN && (
        <div className="bg-blue-50 p-6 border-2 border-blue-200 rounded-xl">
          <h4 className="font-medium text-blue-700 mb-2">Administrator Dashboard</h4>
          <p className="text-blue-600 text-sm leading-relaxed">
            You have full administrative access including user management, moderator reviews, 
            and content deletion permissions. Use the sidebar to navigate to specific management areas.
          </p>
        </div>
      )}

      {user?.role === UserRole.MODERATOR && (
        <div className="bg-green-50 p-6 border-2 border-green-200 rounded-xl">
          <h4 className="font-medium text-green-700 mb-2">Moderator Dashboard</h4>
          <p className="text-green-600 text-sm leading-relaxed">
            As a moderator, you can review and approve content submissions. 
            Contact an administrator if you need additional permissions or have questions.
          </p>
        </div>
      )}
    </div>
  );
};

export default ManagementDashboard;