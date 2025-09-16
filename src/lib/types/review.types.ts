import { ApprovalStatusEnum } from "./response.types";
import { UserProfile } from "./user.types";

export interface ReviewActionDTO {
  action: ApprovalStatusEnum;
  comment?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  query?: string;
  type?: string;
}

export interface ReviewCounts {
  pending: number;
  approved: number;
  rejected: number;
}

export interface ModeratorApplication {
  id: string;
  userId: string;
  reason: string;
  reviewStatus: ApprovalStatusEnum;
  reviewedById: string | null;
  createdAt: string;
  updatedAt: string;
  user: Pick<
    UserProfile,
    "id" | "firstName" | "lastName" | "email" | "username"
  >;
}
