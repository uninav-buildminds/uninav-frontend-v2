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
import {
  mockCreateClub,
  mockDeleteClub,
  mockExportClubAnalytics,
  mockFlagClub,
  mockGetClubAnalytics,
  mockGetClubById,
  mockGetClubFlags,
  mockGetClubRequests,
  mockGetClubs,
  mockRequestClub,
  mockResolveFlag,
  mockTrackClubClick,
  mockUpdateClub,
  mockUpdateClubRequest,
  mockUpdateClubStatus,
} from "@/api/mock/clubs.mock";

const USE_CLUBS_MOCK =
  import.meta.env.VITE_CLUBS_MOCK === "true" ||
  import.meta.env.VITE_CLUBS_MOCK === "1";

// ── Club CRUD ──────────────────────────────────────────────────────────

/** Fetch paginated club listings (public-safe, personalised on server) */
export async function getClubs(
  params: GetClubsParams = {},
): Promise<PaginatedResponse<Club>> {
  if (USE_CLUBS_MOCK) return mockGetClubs(params);
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
  if (USE_CLUBS_MOCK) return mockGetClubById(id);
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

/** Fetch a single club by slug */
export async function getClubBySlug(slug: string): Promise<Response<Club>> {
  if (USE_CLUBS_MOCK) return mockGetClubById(slug);
  try {
    const response = await httpClient.get(`/clubs/slug/${slug}`);
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
  if (USE_CLUBS_MOCK) return mockCreateClub(dto);
  try {
    const formData = new FormData();
    formData.append("name", dto.name);
    formData.append("description", dto.description);
    formData.append("externalLink", dto.externalLink);
    formData.append("targeting", dto.targeting);
    if (dto.tags.length) formData.append("tags", dto.tags.join(","));
    if (dto.interests.length)
      formData.append("interests", dto.interests.join(","));
    if (dto.targetDepartmentIds.length)
      formData.append("targetDepartmentIds", dto.targetDepartmentIds.join(","));
    if (dto.image) formData.append("image", dto.image);

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
  if (USE_CLUBS_MOCK) return mockUpdateClub(id, dto);
  try {
    const formData = new FormData();
    if (dto.name) formData.append("name", dto.name);
    if (dto.description) formData.append("description", dto.description);
    if (dto.externalLink) formData.append("externalLink", dto.externalLink);
    if (dto.targeting) formData.append("targeting", dto.targeting);
    if (dto.tags?.length) formData.append("tags", dto.tags.join(","));
    if (dto.interests?.length)
      formData.append("interests", dto.interests.join(","));
    if (dto.targetDepartmentIds?.length)
      formData.append("targetDepartmentIds", dto.targetDepartmentIds.join(","));
    if (dto.image) formData.append("image", dto.image);

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
  if (USE_CLUBS_MOCK) return mockDeleteClub(id);
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

/** Track a detail-page view — anonymous-safe, fire-and-forget */
export async function trackClubClick(
  id: string,
): Promise<Response<{ clickCount: number }>> {
  if (USE_CLUBS_MOCK) return mockTrackClubClick(id);
  try {
    const response = await httpClient.post(`/clubs/${id}/click`);
    return response.data;
  } catch {
    // Silently ignore — tracking should never break UX
    return { status: "error", message: "Failed to track click", data: { clickCount: 0 } } as any;
  }
}

/** Track a join — authenticated users only, returns externalLink */
export async function trackClubJoin(
  id: string,
): Promise<Response<{ externalLink: string }>> {
  if (USE_CLUBS_MOCK) return mockTrackClubClick(id) as any;
  try {
    const response = await httpClient.post(`/clubs/${id}/join`);
    return response.data;
  } catch (error: any) {
    throw {
      statusCode: error?.status || 500,
      message: error?.data?.message || "Failed to track join",
    };
  }
}

// ── Analytics ──────────────────────────────────────────────────────────

/** Fetch click analytics for a club (organizer / admin) */
export async function getClubAnalytics(
  id: string,
): Promise<Response<ClubAnalytics>> {
  if (USE_CLUBS_MOCK) return mockGetClubAnalytics(id);
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
  if (USE_CLUBS_MOCK) return mockExportClubAnalytics(id);
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
  if (USE_CLUBS_MOCK) return mockFlagClub(clubId, reason);
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
  if (USE_CLUBS_MOCK) return mockGetClubFlags(params);
  try {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    const qs = query.toString();
    const response = await httpClient.get(
      `/clubs/flags/list${qs ? `?${qs}` : ""}`,
    );
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
  if (USE_CLUBS_MOCK) return mockResolveFlag(flagId, action);
  try {
    const response = await httpClient.patch(
      `/clubs/flags/${flagId}/resolve`,
      { action },
    );
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
  if (USE_CLUBS_MOCK) return mockUpdateClubStatus(id, status);
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
  if (USE_CLUBS_MOCK) return mockRequestClub(data);
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
  if (USE_CLUBS_MOCK) return mockGetClubRequests(params);
  try {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    const qs = query.toString();
    const response = await httpClient.get(
      `/clubs/requests/list${qs ? `?${qs}` : ""}`,
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
  if (USE_CLUBS_MOCK) return mockUpdateClubRequest(requestId, status);
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
