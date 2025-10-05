import { httpClient } from "./api";

export type NotificationStatus = "unread" | "read";
export type NotificationType =
  | "material_approved"
  | "material_rejected"
  | "points_awarded"
  | "email_verified"
  | "system";

export interface NotificationDto {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  resourceId?: string | null;
  status: NotificationStatus;
  createdAt: string;
}

export async function getNotifications(params?: {
  page?: number;
  limit?: number;
  query?: string;
  status?: NotificationStatus | "all";
}) {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.query) search.set("query", params.query);
  if (params?.status && params.status !== "all")
    search.set("status", params.status);
  const res = await httpClient.get(
    `/notifications${search.toString() ? `?${search.toString()}` : ""}`
  );
  return res.data?.data as {
    items: NotificationDto[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

export async function markNotificationRead(id: string) {
  const res = await httpClient.patch(`/notifications/${id}/read`);
  return res.data?.data as NotificationDto;
}

export async function markAllNotificationsRead() {
  const res = await httpClient.patch(`/notifications/read-all`);
  return res.data?.data as boolean;
}
