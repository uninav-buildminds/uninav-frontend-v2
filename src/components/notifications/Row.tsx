import React from "react";
import type { NotificationItem } from "./types";
import StatusPill from "./StatusPill";

const Row: React.FC<{ n: NotificationItem }> = ({ n }) => (
  <div className="relative grid grid-cols-12 items-start sm:items-center gap-2 px-4 py-4 border-t border-gray-100 first:border-t-0">
    {/* Icon + Text */}
    <div className="col-span-12 sm:col-span-7 flex items-start gap-3 min-w-0">
      <div className="mt-0.5 shrink-0">{n.icon}</div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{n.title}</div>
        <p className="text-xs sm:text-sm text-gray-600 mt-0.5 break-words">{n.description}</p>
        {/* Mobile meta (time + status top-right) */}
        <div className="mt-2 flex sm:hidden items-center">
          <span className="text-xs text-gray-500">{n.timeLabel}</span>
        </div>
      </div>
    </div>
    {/* Time (hidden on mobile) */}
    <div className="hidden sm:block sm:col-span-3 text-xs sm:text-sm text-gray-500 pl-6">{n.timeLabel}</div>
    {/* Status (left aligned on desktop) */}
    <div className="hidden sm:flex sm:col-span-2"><StatusPill status={n.status} /></div>
    {/* Mobile status bottom-right */}
    <StatusPill status={n.status} className="sm:hidden absolute right-4 bottom-4" />
  </div>
);

export default Row;


