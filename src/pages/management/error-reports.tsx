import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  getErrorReports,
  getErrorReportStats,
  updateErrorReport,
  deleteErrorReport,
  ErrorReport,
  ErrorReportStats,
  ErrorReportSearchParams,
} from "@/api/error-reports.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
  User,
  Calendar,
  Globe,
  Smartphone,
} from "lucide-react";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Severity color mapping
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case "resolved":
      return "bg-green-100 text-green-800 border-green-200";
    case "in_progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "closed":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "open":
    default:
      return "bg-red-100 text-red-800 border-red-200";
  }
};

// Status icon mapping
const getStatusIcon = (status: string) => {
  switch (status) {
    case "resolved":
      return <CheckCircle className="w-4 h-4" />;
    case "in_progress":
      return <Clock className="w-4 h-4" />;
    case "closed":
      return <XCircle className="w-4 h-4" />;
    case "open":
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

const ErrorReportsContent: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([]);
  const [stats, setStats] = useState<ErrorReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Filters and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [errorTypeFilter, setErrorTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Update form state
  const [updateStatus, setUpdateStatus] = useState<string>("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch error reports
  const fetchErrorReports = useCallback(async () => {
    try {
      setLoading(true);
      const params: ErrorReportSearchParams = {
        page: currentPage,
        limit: 10,
      };

      if (debouncedSearchQuery.trim()) {
        params.query = debouncedSearchQuery.trim();
      }
      if (statusFilter !== "all") {
        params.status = statusFilter as any;
      }
      if (severityFilter !== "all") {
        params.severity = severityFilter as any;
      }
      if (errorTypeFilter !== "all") {
        params.errorType = errorTypeFilter;
      }

      const response = await getErrorReports(params);
      if (response.status === "success") {
        setErrorReports(response.data.items);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.total);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch error reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    debouncedSearchQuery,
    statusFilter,
    severityFilter,
    errorTypeFilter,
    toast,
  ]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await getErrorReportStats();
      if (response.status === "success") {
        setStats(response.data);
      }
    } catch (error: any) {
      console.warn("Failed to fetch error statistics:", error);
    }
  }, []);

  // Update error report
  const handleUpdateReport = async (
    reportId: string,
    status: string,
    notes?: string
  ) => {
    try {
      setUpdating(reportId);
      await updateErrorReport(reportId, {
        status: status as any,
        resolutionNotes: notes,
      });

      toast({
        title: "Success",
        description: "Error report updated successfully",
      });

      // Refresh data
      fetchErrorReports();
      fetchStats();
      setShowDetailsDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update error report",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  // Delete error report (Admin only)
  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm("Are you sure you want to delete this error report?")) {
      return;
    }

    try {
      setUpdating(reportId);
      await deleteErrorReport(reportId);

      toast({
        title: "Success",
        description: "Error report deleted successfully",
      });

      // Refresh data
      fetchErrorReports();
      fetchStats();
      setShowDetailsDialog(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete error report",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  // Open details dialog
  const openDetailsDialog = (report: ErrorReport) => {
    setSelectedReport(report);
    setUpdateStatus(report.status);
    setResolutionNotes(report.resolutionNotes || "");
    setShowDetailsDialog(true);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSeverityFilter("all");
    setErrorTypeFilter("all");
    setCurrentPage(1);
  };

  // Get unique error types for filter
  const uniqueErrorTypes = Array.from(
    new Set(errorReports.map((report) => report.errorType))
  );

  useEffect(() => {
    fetchErrorReports();
  }, [fetchErrorReports]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchQuery, statusFilter, severityFilter, errorTypeFilter]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Error Reports
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage error reports from users
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.statusStats.map((stat) => (
            <Card key={stat.status}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 capitalize">
                      {stat.status.replace("_", " ")}
                    </p>
                    <p className="text-2xl font-bold">{stat.count}</p>
                  </div>
                  <div
                    className={`p-2 rounded-lg ${getStatusColor(stat.status)}`}
                  >
                    {getStatusIcon(stat.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            {/* Severity Filter */}
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Error Type Filter */}
            <Select value={errorTypeFilter} onValueChange={setErrorTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueErrorTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={resetFilters}>
              Clear Filters
            </Button>
            <p className="text-sm text-gray-600">
              Showing {errorReports.length} of {totalItems} reports
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Error Reports</CardTitle>
          <CardDescription>
            Click on any report to view details and manage its status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
            </div>
          ) : errorReports.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No error reports found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errorReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{report.title}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {report.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {report.errorType.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(report.severity)}>
                          {report.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(report.status)}
                            {report.status.replace("_", " ")}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.user ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {report.user.firstName} {report.user.lastName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Anonymous
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailsDialog(report)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Error Report Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Error Report Details
            </DialogTitle>
            <DialogDescription>
              View and manage error report information
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Title
                      </label>
                      <p className="text-sm">{selectedReport.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Description
                      </label>
                      <p className="text-sm">{selectedReport.description}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Error Type
                      </label>
                      <Badge variant="outline" className="ml-2">
                        {selectedReport.errorType.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Severity
                      </label>
                      <Badge
                        className={`ml-2 ${getSeverityColor(
                          selectedReport.severity
                        )}`}
                      >
                        {selectedReport.severity}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Context Information</h3>
                  <div className="space-y-2">
                    {selectedReport.user && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Reporter
                        </label>
                        <p className="text-sm">
                          {selectedReport.user.firstName}{" "}
                          {selectedReport.user.lastName}
                          <br />
                          <span className="text-gray-500">
                            {selectedReport.user.email}
                          </span>
                        </p>
                      </div>
                    )}
                    {selectedReport.url && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          URL
                        </label>
                        <p className="text-sm break-all">
                          {selectedReport.url}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Created At
                      </label>
                      <p className="text-sm">
                        {new Date(selectedReport.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Details */}
              {selectedReport.errorDetails && (
                <div>
                  <h3 className="font-semibold mb-2">Error Details</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedReport.errorDetails, null, 2)}
                  </pre>
                </div>
              )}

              {/* Metadata */}
              {selectedReport.metadata && (
                <div>
                  <h3 className="font-semibold mb-2">Additional Context</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedReport.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* Update Status */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Update Status</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <Select
                      value={updateStatus}
                      onValueChange={setUpdateStatus}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Resolution Notes
                    </label>
                    <Textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Add notes about the resolution..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        handleUpdateReport(
                          selectedReport.id,
                          updateStatus,
                          resolutionNotes
                        )
                      }
                      disabled={updating === selectedReport.id}
                    >
                      {updating === selectedReport.id
                        ? "Updating..."
                        : "Update Report"}
                    </Button>

                    {user?.role === "admin" && (
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteReport(selectedReport.id)}
                        disabled={updating === selectedReport.id}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ErrorReportsPage: React.FC = () => {
  return <ErrorReportsContent />;
};

export default ErrorReportsPage;
