import React from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AnalyticsUpIcon,
  Download01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { ClubAnalytics } from "@/lib/types/club.types";
import { exportClubAnalytics } from "@/api/clubs.api";
import { toast } from "sonner";

interface ClubAnalyticsPanelProps {
  clubId: string;
  analytics: ClubAnalytics | null | undefined;
  isLoading?: boolean;
}

const ClubAnalyticsPanel: React.FC<ClubAnalyticsPanelProps> = ({
  clubId,
  analytics,
  isLoading = false,
}) => {
  const handleExport = async () => {
    try {
      const blob = await exportClubAnalytics(clubId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `club-analytics-${clubId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported!");
    } catch {
      toast.error("Failed to export analytics");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
        <div className="h-5 w-32 bg-gray-100 rounded mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gray-50 rounded-xl" />
          <div className="h-20 bg-gray-50 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const topDepts = [...analytics.clicksByDept]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  const maxDeptClicks = topDepts[0]?.clicks || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={AnalyticsUpIcon}
            strokeWidth={1.5}
            size={18}
            className="text-brand"
          />
          <h3 className="text-sm font-semibold text-gray-900">
            Analytics
          </h3>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-brand px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} size={14} />
          Export CSV
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Total clicks */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center">
            <HugeiconsIcon
              icon={UserGroupIcon}
              strokeWidth={1.5}
              size={22}
              className="text-brand"
            />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.totalClicks.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Total clicks</p>
          </div>
        </div>

        {/* Clicks by department */}
        {topDepts.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Clicks by Department
            </h4>
            <div className="space-y-2.5">
              {topDepts.map((dept) => (
                <div key={dept.departmentId}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate max-w-[60%]">
                      {dept.departmentName}
                    </span>
                    <span className="text-gray-500 font-medium">
                      {dept.clicks}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-500"
                      style={{
                        width: `${(dept.clicks / maxDeptClicks) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Click trend */}
        {analytics.clickTrend.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Click Trend (Last 14 days)
            </h4>
            <div className="flex items-end gap-1 h-16">
              {analytics.clickTrend.slice(-14).map((point, i) => {
                const max =
                  Math.max(
                    ...analytics.clickTrend.slice(-14).map((p) => p.clicks),
                  ) || 1;
                const height = Math.max((point.clicks / max) * 100, 4);
                return (
                  <div
                    key={i}
                    className="flex-1 bg-brand/20 hover:bg-brand/40 rounded-t transition-colors"
                    style={{ height: `${height}%` }}
                    title={`${point.date}: ${point.clicks} clicks`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Joins trend */}
        {analytics.joinTrend && analytics.joinTrend.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Joins Trend (Last 14 days)
            </h4>
            <div className="flex items-end gap-1 h-16">
              {analytics.joinTrend.slice(-14).map((point, i) => {
                const max =
                  Math.max(
                    ...analytics.joinTrend.slice(-14).map((p) => p.joins),
                  ) || 1;
                const height = Math.max((point.joins / max) * 100, 4);
                return (
                  <div
                    key={i}
                    className="flex-1 bg-emerald-400/30 hover:bg-emerald-400/50 rounded-t transition-colors"
                    style={{ height: `${height}%` }}
                    title={`${point.date}: ${point.joins} join${point.joins !== 1 ? "s" : ""}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClubAnalyticsPanel;
