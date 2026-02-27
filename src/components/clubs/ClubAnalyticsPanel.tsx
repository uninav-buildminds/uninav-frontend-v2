import React from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AnalyticsUpIcon,
  Link04Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { ClubAnalytics } from "@/lib/types/club.types";

interface ClubAnalyticsPanelProps {
  analytics: ClubAnalytics | null | undefined;
  isLoading?: boolean;
}

const ClubAnalyticsPanel: React.FC<ClubAnalyticsPanelProps> = ({
  analytics,
  isLoading = false,
}) => {
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

  const joinTrend = analytics.joinTrend ?? [];
  const maxJoins = Math.max(...joinTrend.map((p) => p.joins), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-5 border-b border-gray-50">
        <HugeiconsIcon
          icon={AnalyticsUpIcon}
          strokeWidth={1.5}
          size={18}
          className="text-brand"
        />
        <h3 className="text-sm font-semibold text-gray-900">Analytics</h3>
      </div>

      <div className="p-5 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Clicks */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center">
                <HugeiconsIcon
                  icon={Link04Icon}
                  strokeWidth={1.5}
                  size={14}
                  className="text-brand"
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">Clicks</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.totalClicks.toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Times link was clicked
            </p>
          </div>

          {/* Joins */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                <HugeiconsIcon
                  icon={UserGroupIcon}
                  strokeWidth={1.5}
                  size={14}
                  className="text-emerald-600"
                />
              </div>
              <span className="text-xs text-emerald-700 font-medium">
                Joins
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.totalJoins.toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-600/70 mt-0.5">
              Unique users joined
            </p>
          </div>
        </div>

        {/* Joins trend graph */}
        {joinTrend.length > 0 ? (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Joins — Last 14 days
            </h4>
            <div className="relative h-24">
              <div className="absolute inset-0 flex items-end gap-1">
                {joinTrend.slice(-14).map((point, i) => {
                  const heightPx = Math.max((point.joins / maxJoins) * 96, 6);
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-emerald-400/50 hover:bg-emerald-500/60 rounded-t transition-colors cursor-default"
                      style={{ height: `${heightPx}px` }}
                      title={`${point.date}: ${point.joins} join${point.joins !== 1 ? "s" : ""}`}
                    />
                  );
                })}
              </div>
            </div>
            {/* x-axis date labels — first and last */}
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-gray-400">
                {joinTrend[0]?.date}
              </span>
              <span className="text-[10px] text-gray-400">
                {joinTrend[joinTrend.length - 1]?.date}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-4">
            No join activity in the last 14 days
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ClubAnalyticsPanel;
