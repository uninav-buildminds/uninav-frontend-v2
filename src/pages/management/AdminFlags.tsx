import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Alert02Icon,
  CheckmarkCircle01Icon,
  ViewOffIcon,
  Cancel01Icon,
  EyeIcon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/hooks/useAuth";
import { useClubFlags, useResolveFlag } from "@/hooks/useClubs";
import { formatRelativeTime } from "@/lib/utils";

const AdminFlags: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading } = useClubFlags({
    page,
    limit: 20,
    status: statusFilter || undefined,
  });
  const flags = data?.flags ?? [];
  const pagination = data?.pagination;

  const resolveMutation = useResolveFlag();

  // Guard
  if (user && user.role !== "admin" && user.role !== "moderator") {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/management")}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-3 transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} size={18} />
          Back to Management
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Flagged Clubs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review clubs reported by users.
        </p>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 mb-6">
        {[
          { v: "", l: "All" },
          { v: "pending", l: "Pending" },
          { v: "reviewed", l: "Reviewed" },
          { v: "dismissed", l: "Dismissed" },
        ].map(({ v, l }) => (
          <button
            key={l}
            onClick={() => {
              setStatusFilter(v);
              setPage(1);
            }}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              statusFilter === v
                ? "bg-brand text-white border-brand"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Flags list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : flags.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-500">
          No flags to review.
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => (
            <motion.div
              key={flag.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Club name */}
                  <button
                    onClick={() =>
                      flag.club && navigate(`/clubs/${flag.club.id}`)
                    }
                    className="text-sm font-semibold text-gray-900 hover:text-brand transition-colors"
                  >
                    {flag.club?.name ?? "Unknown Club"}
                  </button>

                  {/* Reason */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <HugeiconsIcon
                      icon={Alert02Icon}
                      strokeWidth={1.5}
                      size={14}
                      className="text-amber-500"
                    />
                    <p className="text-sm text-gray-600">{flag.reason}</p>
                  </div>

                  {/* Reporter & date */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>
                      By{" "}
                      {flag.reporter
                        ? `${flag.reporter.firstName} ${flag.reporter.lastName}`
                        : "Anonymous"}
                    </span>
                    <span>{formatRelativeTime(flag.createdAt)}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        flag.status === "pending"
                          ? "bg-amber-50 text-amber-600"
                          : flag.status === "reviewed"
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {flag.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {flag.status === "pending" && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() =>
                        resolveMutation.mutate({
                          flagId: flag.id,
                          action: "approve",
                        })
                      }
                      className="p-2 rounded-xl hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                      title="Approve (keep live)"
                    >
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        strokeWidth={1.5}
                        size={18}
                      />
                    </button>
                    <button
                      onClick={() =>
                        resolveMutation.mutate({
                          flagId: flag.id,
                          action: "hide",
                        })
                      }
                      className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      title="Hide club"
                    >
                      <HugeiconsIcon
                        icon={ViewOffIcon}
                        strokeWidth={1.5}
                        size={18}
                      />
                    </button>
                    <button
                      onClick={() =>
                        resolveMutation.mutate({
                          flagId: flag.id,
                          action: "dismiss",
                        })
                      }
                      className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Dismiss flag"
                    >
                      <HugeiconsIcon
                        icon={Cancel01Icon}
                        strokeWidth={1.5}
                        size={18}
                      />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={!pagination.hasPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasMore}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminFlags;
