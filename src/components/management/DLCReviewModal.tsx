import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useDepartments } from "@/hooks/useDepartments";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DLC } from "@/lib/types/dlc.types";
import { UserRole } from "@/lib/types/response.types";
import {
  Building,
  GraduationCap,
  ExternalLink,
  Calendar,
  Users,
  BookOpen,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";

interface DLCReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  dlc: DLC | null;
  onApprove?: (dlc: DLC) => void;
  onReject?: (dlc: DLC) => void;
  onDelete?: (dlc: DLC) => void;
  activeTab: string;
}

const DLCReviewModal: React.FC<DLCReviewModalProps> = ({
  isOpen,
  onClose,
  dlc,
  onApprove,
  onReject,
  onDelete,
  activeTab,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { getDepartmentById } = useDepartments();

  if (!dlc) return null;

  const department = getDepartmentById(dlc.departmentId);
  const canEdit =
    user?.role === UserRole.ADMIN || user?.role === UserRole.MODERATOR;

  const handleViewInDashboard = () => {
    navigate("/dashboard");
  };

  const handleApprove = () => {
    if (onApprove) {
      onApprove(dlc);
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject(dlc);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(dlc);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Department Level Course Review
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Department Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">
                Department
              </h3>
            </div>
            <div className="space-y-2">
              <div>
                <h4 className="font-semibold text-gray-900">
                  {department?.name || dlc.departmentId}
                </h4>
                {department?.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {department.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                  Level {dlc.level}
                </Badge>
                <Badge
                  variant="outline"
                  className={`${
                    dlc.reviewStatus === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : dlc.reviewStatus === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {dlc.reviewStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Course Information */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">
                Course to be Linked
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">
                  {dlc.course.courseName}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-600 text-white">
                    {dlc.course.courseCode}
                  </Badge>
                </div>
              </div>

              {dlc.course.description && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-1">
                    Description:
                  </h5>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {dlc.course.description}
                  </p>
                </div>
              )}

              {dlc.course.departments && dlc.course.departments.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">
                    Currently Associated Departments:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {dlc.course.departments.map((dept) => (
                      <Badge
                        key={dept.id}
                        variant="outline"
                        className="bg-gray-100"
                      >
                        {dept.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Review Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Review Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-700 mb-1">
                  Review Status:
                </h5>
                <Badge
                  variant="outline"
                  className={`${
                    dlc.reviewStatus === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : dlc.reviewStatus === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {dlc.reviewStatus}
                </Badge>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-1">Level:</h5>
                <span className="text-sm text-gray-600">Level {dlc.level}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleViewInDashboard}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View in Dashboard
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {canEdit && (
                <>
                  <Button
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={handleReject}
                    variant="destructive"
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
              {user?.role === UserRole.ADMIN && (
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DLCReviewModal;
