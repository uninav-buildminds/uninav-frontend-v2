import { PaginatedResponse, Response } from "@/lib/types/response.types";
import { httpClient } from "./api";
import {
  Club,
  ClubAnalytics,
  ClubFlag,
  ClubRequest,
  ClubStatusEnum,
  CreateClubDto,
  GetClubsParams,
  UpdateClubDto,
} from "@/lib/types/club.types";

// ── Club CRUD ──────────────────────────────────────────────────────────

/** Fetch paginated club listings (public-safe, personalised on server) */
export async function getClubs(
  params: GetClubsParams = {},
): Promise<PaginatedResponse<Club>> {
  try {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.interest) query.set("interest", params.interest);
    if (params.departmentId) query.set("departmentId", params.departmentId);
    if (params.status) query.set("status", params.status);
    if (params.organizerId) query.set("organizerId", params.organizerId);

    const qs = query.toString();
    const response = await httpClient.get(`/clubs${qs ? `?${qs}` : ""}`);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error?.status || 500,
      message: error?.data?.message || "Failed to fetch clubs",
    };
  }
}

/** Fetch a single club by ID */
export async function getClubById(id: string): Promise<Response<Club>> {
  try {
    const response = await httpClient.get(`/clubs/${id}`);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error?.status || 500,
      message: error?.data?.message || "Failed to fetch club",
    };
  }
}

/** Create a new club (authenticated) */
export async function createClub(dto: CreateClubDto): Promise<Response<Club>> {
  try {
    const formData = new FormData();
    formData.append("name", dto.name);
    formData.append("description", dto.description);
    formData.append("externalLink", dto.externalLink);
    formData.append("targeting", dto.targeting);
    dto.tags.forEach((t) => formData.append("tags[]", t));
    dto.interests.forEach((i) => formData.append("interests[]", i));
    dto.targetDepartmentIds.forEach((d) =>
      formData.append("targetDepartmentIds[]", d),
    );
    if (dto.image) formData.append("image", dto.image);
    if (dto.banner) formData.append("banner", dto.banner);

    const response = await httpClient.post("/clubs", formData);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error?.status || 500,
      message: error?.data?.message || "Failed to create club",
    };
  }
}

/** Update an existing club (organizer-only) */
export async function updateClub(
  id: string,
  dto: UpdateClubDto,
): Promise<Response<Club>> {
  try {
    const formData = new FormData();
    if (dto.name) formData.append("name", dto.name);
    if (dto.description) formData.append("description", dto.description);
    if (dto.externalLink) formData.append("externalLink", dto.externalLink);
    if (dto.targeting) formData.append("targeting", dto.targeting);
    if (dto.tags) dto.tags.forEach((t) => formData.append("tags[]", t));
    if (dto.interests)
      dto.interests.forEach((i) => formData.append("interests[]", i));
    if (dto.targetDepartmentIds)
      dto.targetDepartmentIds.forEach((d) =>
        formData.append("targetDepartmentIds[]", d),
      );
    if (dto.image) formData.append("image", dto.image);
    if (dto.banner) formData.append("banner", dto.banner);

    const response = await httpClient.patch(`/clubs/${id}`, formData);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error?.status || 500,
      message: error?.data?.message || "Failed to update club",
    };
  }
}

/** Delete a club (organizer or admin) */
export async function deleteClub(id: string): Promise<Response<void>> {
  try {
    const response = await httpClient.delete(`/clubs/${id}`);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error?.status || 500,
      message: error?.data?.message || "Failed to delete club",
    };
  }
}

// ── Click tracking ────────────────────────────────────────────────────

/** Log a click redirect (server returns the external URL) */
export async function trackClubClick(
  id: string,
): Promise<Response<{ externalLink: string }>> {
  try {
    const response = await httpClient.post(`/clubs/${id}/click`);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error?.status || 500,
      message: error?.data?.message || "Failed to track click",
    };
  }
}

// ── Analytics ──────────────────────────────────────────────────────────

/** Fetch click analytics for a club (organizer / admin) */
export async function getClubAnalytics(
  id: string,
): Promise<Response<ClubAnalytics>> {
  try {
    const response = await httpClient.get(`/clubs/${id}/analytics`);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error?.status || 500,
      message: error?.data?.message || "Failed to fetch analytics",
    };
  }
}

/** Export club analytics as CSV blob */
export async function exportClubAnalytics(id: string): Promise<Blob> {
  try {
    const response = await httpClient.get(`/clubs/${id}/analytics/export`, {
      responseType: "blob",
    } as any);
    return response.data as unknown as Blob;
  } catch (error: any) {
    throw {
      statusCode: error?.status || 500,
      message: error?.data?.message || "Failed to export analytics",
    };
  }
}

// ── Flag / Report ─────────────────────────────────────────────────────

/** Flag a club for review */
export async function flagClub(
  clubId: string,
  reason: string,
): Promise<Response<ClubFlag>> {
  try {
    const response = await httpClient.post(`/clubs/${clubId}/flag`, { reason });
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error?.status || 500,
      message: error?.data?.message || "Failed to flag club",
    };
  }
}

/** Get all flags (admin) */
export async function getClubFlags(
  params: { page?: number; limit?: number; status?: string } = {},
): Promise<PaginatedResponse<ClubFlag>> {
  try {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    const qs = query.toString();
    const response = await httpClient.get(`/clubs/flags${qs ? `?${qs}` : ""}`);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error?.status || 500,
      message: error?.data?.message || "Failed to fetch flags",
    };
  }
}

/** Resolve a flag (admin) */
export async function resolveFlag(
  flagId: string,
  action: "approve" | "hide" | "dismiss",
): Promise<Response<ClubFlag>> {
  try {
    const response = await httpClient.patch(`/clubs/flags/${flagId}`, {
      action,
    });
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error?.status || 500,
      message: error?.data?.message || "Failed to resolve flag",
    };
  }
}

// ── Club status (admin) ───────────────────────────────────────────────

/** Update club status (admin: approve / hide) */
export async function updateClubStatus(
  id: string,
  status: ClubStatusEnum,
): Promise<Response<Club>> {
  try {
    const response = await httpClient.patch(`/clubs/${id}/status`, { status });
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error?.status || 500,
      message: error?.data?.message || "Failed to update club status",
    };
  }
}

// ── Club Requests ─────────────────────────────────────────────────────

/** Submit a "request a club" entry */
export async function requestClub(data: {
  name: string;
  interest: string;
  message?: string;
}): Promise<Response<ClubRequest>> {
  try {
    const response = await httpClient.post("/clubs/requests", data);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error?.status || 500,
      message: error?.data?.message || "Failed to submit request",
    };
  }
}

/** Get all requests (admin) */
export async function getClubRequests(
  params: { page?: number; limit?: number; status?: string } = {},
): Promise<PaginatedResponse<ClubRequest>> {
  try {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    const qs = query.toString();
    const response = await httpClient.get(
      `/clubs/requests${qs ? `?${qs}` : ""}`,
    );
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error?.status || 500,
      message: error?.data?.message || "Failed to fetch requests",
    };
  }
}

/** Update a request status (admin) */
export async function updateClubRequest(
  requestId: string,
  status: "fulfilled" | "dismissed",
): Promise<Response<ClubRequest>> {
  try {
    const response = await httpClient.patch(`/clubs/requests/${requestId}`, {
      status,
    });
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error?.status || 500,
      message: error?.data?.message || "Failed to update request",
    };
  }
}
