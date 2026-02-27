import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Search01Icon,
  EyeIcon,
  ViewIcon,
  ViewOffIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/hooks/useAuth";
import { useClubs, useUpdateClubStatus } from "@/hooks/useClubs";
import { Club, ClubStatusEnum } from "@/lib/types/club.types";
import { formatRelativeTime } from "@/lib/utils";

const AdminClubs: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClubStatusEnum | "">("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useClubs({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  });
  const clubs = data?.clubs ?? [];
  const pagination = data?.pagination;

  const updateStatusMutation = useUpdateClubStatus();

  const handleStatusChange = (club: Club, newStatus: ClubStatusEnum) => {
    updateStatusMutation.mutate({ id: club.id, status: newStatus });
  };

  // Guard: admin/moderator only
  if (user && user.role !== "admin" && user.role !== "moderator") {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/management")}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-3 transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} size={18} />
          Back to Management
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Admin — Clubs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review all clubs, manage statuses, and handle flagged content.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={1.5}
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search clubs..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {[
            { v: "", l: "All" },
            { v: ClubStatusEnum.LIVE, l: "Live" },
            { v: ClubStatusEnum.FLAGGED, l: "Flagged" },
            { v: ClubStatusEnum.HIDDEN, l: "Hidden" },
          ].map(({ v, l }) => (
            <button
              key={l}
              onClick={() => {
                setStatusFilter(v as any);
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
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-500">
          No clubs match your criteria.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Club
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Organizer
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {clubs.map((club) => (
                  <tr
                    key={club.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigate(`/clubs/${club.id}`)}
                        className="text-left"
                      >
                        <p className="font-medium text-gray-900 hover:text-brand transition-colors truncate max-w-[200px]">
                          {club.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatRelativeTime(club.createdAt)}
                        </p>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-gray-500 hidden md:table-cell">
                      {club.organizer
                        ? `${club.organizer.firstName} ${club.organizer.lastName}`
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <HugeiconsIcon
                          icon={EyeIcon}
                          strokeWidth={1.5}
                          size={14}
                        />
                        {club.clickCount ?? 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          club.status === "live"
                            ? "bg-green-50 text-green-600"
                            : club.status === "flagged"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {club.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {club.status !== "live" && (
                          <button
                            onClick={() =>
                              handleStatusChange(club, ClubStatusEnum.LIVE)
                            }
                            className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                            title="Approve / Go Live"
                          >
                            <HugeiconsIcon
                              icon={CheckmarkCircle01Icon}
                              strokeWidth={1.5}
                              size={16}
                            />
                          </button>
                        )}
                        {club.status !== "hidden" && (
                          <button
                            onClick={() =>
                              handleStatusChange(club, ClubStatusEnum.HIDDEN)
                            }
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Hide"
                          >
                            <HugeiconsIcon
                              icon={ViewOffIcon}
                              strokeWidth={1.5}
                              size={16}
                            />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-50">
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
      )}
    </div>
  );
};

export default AdminClubs;
