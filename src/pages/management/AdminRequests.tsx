import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/hooks/useAuth";
import { useClubRequests, useUpdateClubRequest } from "@/hooks/useClubs";
import { formatRelativeTime } from "@/lib/utils";

const AdminRequests: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading } = useClubRequests({
    page,
    limit: 20,
    status: statusFilter || undefined,
  });
  const requests = data?.requests ?? [];
  const pagination = data?.pagination;

  const updateMutation = useUpdateClubRequest();

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
        <h1 className="text-2xl font-bold text-gray-900">Club Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Students requesting clubs that don't exist yet.
        </p>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 mb-6">
        {[
          { v: "", l: "All" },
          { v: "pending", l: "Pending" },
          { v: "fulfilled", l: "Fulfilled" },
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

      {/* Requests list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-brand/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HugeiconsIcon
              icon={UserGroupIcon}
              strokeWidth={1.5}
              size={28}
              className="text-brand"
            />
          </div>
          <p className="text-sm text-gray-500">No club requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {req.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand/8 text-brand">
                      {req.interest}
                    </span>
                  </div>
                  {req.message && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {req.message}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>
                      By{" "}
                      {req.requester
                        ? `${req.requester.firstName} ${req.requester.lastName}`
                        : "Anonymous"}
                    </span>
                    {req.requester?.department && (
                      <span>{req.requester.department.name}</span>
                    )}
                    <span>{formatRelativeTime(req.createdAt)}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        req.status === "pending"
                          ? "bg-amber-50 text-amber-600"
                          : req.status === "fulfilled"
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {req.status === "pending" && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() =>
                        updateMutation.mutate({
                          requestId: req.id,
                          status: "fulfilled",
                        })
                      }
                      className="p-2 rounded-xl hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                      title="Mark fulfilled"
                    >
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        strokeWidth={1.5}
                        size={18}
                      />
                    </button>
                    <button
                      onClick={() =>
                        updateMutation.mutate({
                          requestId: req.id,
                          status: "dismissed",
                        })
                      }
                      className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Dismiss"
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

export default AdminRequests;
