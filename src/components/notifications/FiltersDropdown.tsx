import React from "react";
import type { NotificationStatus } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  status: "all" | NotificationStatus;
  setStatus: (s: "all" | NotificationStatus) => void;
  timeframe: "all" | "today" | "last2days";
  setTimeframe: (t: "all" | "today" | "last2days") => void;
}

const FiltersDropdown: React.FC<Props> = ({ status, setStatus, timeframe, setTimeframe }) => (
  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow z-dropdown p-3" data-clickout-id="notif-filters">
    <div className="text-xs font-medium text-gray-500 mb-2">Filters</div>
    <div className="space-y-3">
      <div className="grid grid-cols-2 items-center gap-3">
        <span className="text-sm text-gray-700">Status</span>
        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 items-center gap-3">
        <span className="text-sm text-gray-700">Timeframe</span>
        <Select value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="last2days">Last 2 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

export default FiltersDropdown;


