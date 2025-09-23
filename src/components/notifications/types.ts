import React from "react";

export type NotificationStatus = "unread" | "read";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  status: NotificationStatus;
  group: string;
  icon: React.ReactNode;
}


