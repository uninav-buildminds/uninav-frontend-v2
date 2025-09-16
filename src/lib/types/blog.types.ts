import { ApprovalStatusEnum } from "./response.types";
import { UserProfile } from "./user.types";

export interface Blog {
  id: string;
  title: string;
  description?: string;
  content?: string;
  tags: string[];
  headingImageAddress?: string;
  type: string;
  views: number;
  likes: number;
  reviewStatus: ApprovalStatusEnum;
  reviewedBy?: Pick<UserProfile, "id" | "username" | "firstName" | "lastName">;
  creator: Pick<UserProfile, "id" | "username" | "firstName" | "lastName">;
  createdAt: string;
  updatedAt: string;
}
