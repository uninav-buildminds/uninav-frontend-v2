import { httpClient } from "./api";
import { Response, ResponseSuccess } from "@/lib/types/response.types";

// Error report types
export interface ErrorReport {
  id: string;
  userId?: string;
  title: string;
  description: string;
  errorType: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  metadata?: Record<string, any>;
  errorDetails?: Record<string, any>;
  userAgent?: string;
  url?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateErrorReportForm {
  title: string;
  description: string;
  errorType: string;
  severity?: "low" | "medium" | "high" | "critical";
  metadata?: Record<string, any>;
  errorDetails?: Record<string, any>;
  userAgent?: string;
  url?: string;
}

export interface UpdateErrorReportForm {
  status?: "open" | "in_progress" | "resolved" | "closed";
  resolutionNotes?: string;
}

export interface ErrorReportStats {
  statusStats: Array<{ status: string; count: number }>;
  severityStats: Array<{ severity: string; count: number }>;
  typeStats: Array<{ errorType: string; count: number }>;
}

export interface ErrorReportSearchParams {
  page?: number;
  limit?: number;
  query?: string;
  errorType?: string;
  severity?: "low" | "medium" | "high" | "critical";
  status?: "open" | "in_progress" | "resolved" | "closed";
  userId?: string;
  resolvedBy?: string;
}

/**
 * Create a new error report
 * Public endpoint - can be used by authenticated or anonymous users
 */
export async function createErrorReport(
  errorData: CreateErrorReportForm
): Promise<Response<ErrorReport>> {
  try {
    // Automatically capture some context
    const enrichedData = {
      ...errorData,
      userAgent: navigator.userAgent,
      url: window.location.href,
      metadata: {
        ...errorData.metadata,
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
    };

    const response = await httpClient.post("/error-reports", enrichedData);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Failed to submit error report. Please try again.",
    };
  }
}

/**
 * Get all error reports with filtering and pagination
 * Admin/Moderator only
 */
export async function getErrorReports(params: ErrorReportSearchParams): Promise<
  ResponseSuccess<{
    items: ErrorReport[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }>
> {
  try {
    const response = await httpClient.get("/error-reports", { params });
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Failed to fetch error reports. Please try again.",
    };
  }
}

/**
 * Get error statistics for admin dashboard
 * Admin/Moderator only
 */
export async function getErrorReportStats(): Promise<
  Response<ErrorReportStats>
> {
  try {
    const response = await httpClient.get("/error-reports/stats");
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Failed to fetch error statistics. Please try again.",
    };
  }
}

/**
 * Get current user's error reports
 * Authenticated users only
 */
export async function getMyErrorReports(
  params: Partial<ErrorReportSearchParams>
): Promise<
  ResponseSuccess<{
    items: ErrorReport[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }>
> {
  try {
    const response = await httpClient.get("/error-reports/my-reports", {
      params,
    });
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Failed to fetch your error reports. Please try again.",
    };
  }
}

/**
 * Get a specific error report by ID
 * Admin/Moderator only
 */
export async function getErrorReportById(
  id: string
): Promise<Response<ErrorReport>> {
  try {
    const response = await httpClient.get(`/error-reports/${id}`);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Failed to fetch error report. Please try again.",
    };
  }
}

/**
 * Update an error report (typically for resolution)
 * Admin/Moderator only
 */
export async function updateErrorReport(
  id: string,
  updateData: UpdateErrorReportForm
): Promise<Response<ErrorReport>> {
  try {
    const response = await httpClient.patch(`/error-reports/${id}`, updateData);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Failed to update error report. Please try again.",
    };
  }
}

/**
 * Delete an error report
 * Admin only
 */
export async function deleteErrorReport(
  id: string
): Promise<Response<boolean>> {
  try {
    const response = await httpClient.delete(`/error-reports/${id}`);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        "Failed to delete error report. Please try again.",
    };
  }
}

/**
 * Helper function to create error reports from caught errors
 * Automatically extracts error details and creates a report
 */
export async function reportError(
  title: string,
  error: any,
  context?: {
    errorType?: string;
    severity?: "low" | "medium" | "high" | "critical";
    additionalMetadata?: Record<string, any>;
  }
): Promise<void> {
  try {
    const errorDetails: Record<string, any> = {};

    if (error instanceof Error) {
      errorDetails.message = error.message;
      errorDetails.name = error.name;
      errorDetails.stack = error.stack;
    } else if (typeof error === "object") {
      errorDetails.error = error;
    } else {
      errorDetails.error = String(error);
    }

    await createErrorReport({
      title,
      description: `Automatic error report: ${
        errorDetails.message || "Unknown error"
      }`,
      errorType: context?.errorType || "automatic_report",
      severity: context?.severity || "medium",
      errorDetails,
      metadata: context?.additionalMetadata,
    });
  } catch (reportingError) {
    // Silently fail if error reporting fails to avoid infinite loops
    console.warn("Failed to report error:", reportingError);
  }
}
