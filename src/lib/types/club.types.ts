import { Department } from "./department.types";
import { UserProfile } from "./user.types";

// ── Enums ──────────────────────────────────────────────────────────────

export enum ClubStatusEnum {
  LIVE = "live",
  FLAGGED = "flagged",
  HIDDEN = "hidden",
}

export enum ClubTargetingEnum {
  PUBLIC = "public",
  SPECIFIC = "specific",
  EXCLUDE = "exclude",
}

// ── Core Club ──────────────────────────────────────────────────────────

export interface Club {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  bannerUrl?: string;
  externalLink: string;
  redirectUrl: string; // auto-generated uninav.live/clubs/[id]
  tags: string[];
  interests: string[];
  targeting: ClubTargetingEnum;
  targetDepartmentIds: string[]; // dept IDs when targeting = specific / exclude
  targetDepartments?: Department[];
  status: ClubStatusEnum;
  organizerId: string;
  organizer?: Pick<
    UserProfile,
    "id" | "firstName" | "lastName" | "profilePicture" | "department"
  >;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

// ── DTOs ───────────────────────────────────────────────────────────────

export interface CreateClubDto {
  name: string;
  description: string;
  externalLink: string;
  tags: string[];
  interests: string[];
  targeting: ClubTargetingEnum;
  targetDepartmentIds: string[];
  image?: File;
  banner?: File;
}

export interface UpdateClubDto extends Partial<CreateClubDto> {}

// ── Analytics ──────────────────────────────────────────────────────────

export interface ClubClickLog {
  id: string;
  clubId: string;
  departmentId?: string;
  departmentName?: string;
  timestamp: string;
}

export interface ClubAnalytics {
  totalClicks: number;
  clicksByDept: {
    departmentId: string;
    departmentName: string;
    clicks: number;
  }[];
  clickTrend: { date: string; clicks: number }[];
}

// ── Request & Flag ─────────────────────────────────────────────────────

export interface ClubRequest {
  id: string;
  name: string;
  interest: string;
  message?: string;
  requesterId: string;
  requester?: Pick<UserProfile, "id" | "firstName" | "lastName" | "department">;
  status: "pending" | "fulfilled" | "dismissed";
  createdAt: string;
}

export interface ClubFlag {
  id: string;
  clubId: string;
  club?: Club;
  reason: string;
  reporterId: string;
  reporter?: Pick<UserProfile, "id" | "firstName" | "lastName">;
  status: "pending" | "reviewed" | "dismissed";
  createdAt: string;
}

// ── Query params ───────────────────────────────────────────────────────

export interface GetClubsParams {
  page?: number;
  limit?: number;
  search?: string;
  interest?: string;
  departmentId?: string;
  status?: ClubStatusEnum;
  organizerId?: string;
}
