import { ApprovalStatusEnum } from "./response.types";
import { UserProfile } from "./user.types";

export interface Advert {
  id: string;
  title: string;
  description: string;
  content: string;
  type: string;
  tags?: string[];
  bannerImageAddress?: string;
  externalLink?: string;
  likes: number;
  views: number;
  clicks: number;
  reviewStatus: ApprovalStatusEnum;
  creator: Pick<UserProfile, "id" | "firstName" | "lastName" | "username">;
  material?: any;
  collection?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFreeAdvertDto {
  label: string;
  description?: string;
  materialId?: string;
  collectionId?: string;
  image?: File;
}
