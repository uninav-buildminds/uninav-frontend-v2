import React from "react";
import type { NotificationStatus } from "./types";

const StatusPill: React.FC<{ status: NotificationStatus; className?: string }>= ({ status, className }) => (
  <span
    className={
      (className || "") +
      " inline-flex items-center justify-center px-3 py-1 text-xs rounded-full font-medium " +
      (status === "unread" ? "bg-[#E9EDFF] text-[#3E41DD]" : "bg-gray-100 text-gray-600")
    }
  >
    {status === "unread" ? "Unread" : "Read"}
  </span>
);

export default StatusPill;


