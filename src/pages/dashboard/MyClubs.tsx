import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowLeft01Icon,
  AnalyticsUpIcon,
  Delete01Icon,
  Edit01Icon,
  EyeIcon,
  Link04Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/hooks/useAuth";
import {
  useMyClubs,
  useUpdateClub,
  useDeleteClub,
  useCreateClub,
  useClubAnalytics,
} from "@/hooks/useClubs";
import {
  PostClubModal,
  DeleteClubModal,
  ClubsEmptyState,
  ClubAnalyticsPanel,
} from "@/components/clubs";
import { Club, CreateClubDto, UpdateClubDto } from "@/lib/types/club.types";
import { formatRelativeTime } from "@/lib/utils";

const MyClubs: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading } = useMyClubs(user?.id);
  const clubs = data?.clubs ?? [];

  const createMutation = useCreateClub();
  const updateMutation = useUpdateClub();
  const deleteMutation = useDeleteClub();

  const [showPostModal, setShowPostModal] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [deletingClub, setDeletingClub] = useState<Club | null>(null);
  const [analyticsClubId, setAnalyticsClubId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data: analytics, isLoading: analyticsLoading } = useClubAnalytics(
    analyticsClubId || undefined,
  );

  const handlePost = (dto: CreateClubDto) => {
    if (editingClub) {
      updateMutation.mutate(
        { id: editingClub.id, dto: dto as UpdateClubDto },
        {
          onSuccess: () => {
            setEditingClub(null);
            setShowPostModal(false);
          },
        },
      );
    } else {
      createMutation.mutate(dto, {
        onSuccess: () => setShowPostModal(false),
      });
    }
  };

  const handleDelete = () => {
    if (!deletingClub) return;
    deleteMutation.mutate(deletingClub.id, {
      onSuccess: () => setDeletingClub(null),
    });
  };

  const toggleAnalytics = (clubId: string) => {
    setAnalyticsClubId((prev) => (prev === clubId ? null : clubId));
  };

  if (!user) {
    navigate("/auth/signin");
    return null;
  }

  return (
    <>
      {/* Header */}
      <section className="relative overflow-visible z-sticky">
        <div className="bg-gradient-to-br from-[theme(colors.dashboard.gradientFrom)] to-[theme(colors.dashboard.gradientTo)]">
          <div className="px-2 sm:px-4 pt-16 sm:pt-20 pb-6 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => navigate("/dashboard/clubs")}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  strokeWidth={1.5}
                  size={18}
                />
                Back to Clubs
              </button>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                    My Clubs
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Manage clubs you've posted, view analytics, and edit
                    details.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingClub(null);
                    setShowPostModal(true);
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-white bg-brand px-4 py-2.5 rounded-xl hover:bg-brand/90 transition-colors shadow-sm"
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} size={16} />
                  Post Club
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-10 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Mobile post button */}
        <button
          onClick={() => {
            setEditingClub(null);
            setShowPostModal(true);
          }}
          className="sm:hidden w-full mb-4 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-brand px-4 py-2.5 rounded-xl hover:bg-brand/90 transition-colors shadow-sm"
        >
          <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} size={16} />
          Post Club
        </button>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-1/3 bg-gray-100 rounded" />
                    <div className="h-3 w-1/2 bg-gray-50 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <ClubsEmptyState
            type="no-my-clubs"
            onAction={() => setShowPostModal(true)}
          />
        ) : (
          <div className="space-y-4">
            {clubs.map((club) => (
              <motion.div
                key={club.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-5 flex items-start gap-4">
                  {/* Club image */}
                  <div
                    className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-brand/5 flex items-center justify-center cursor-pointer"
                    onClick={() => navigate(`/dashboard/clubs/${club.id}`)}
                  >
                    {club.imageUrl ? (
                      <img
                        src={club.imageUrl}
                        alt={club.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <HugeiconsIcon
                        icon={Link04Icon}
                        strokeWidth={1.5}
                        size={22}
                        className="text-brand/40"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/dashboard/clubs/${club.id}`)}
                  >
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {club.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                      {club.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon
                          icon={EyeIcon}
                          strokeWidth={1.5}
                          size={12}
                        />
                        {club.clickCount ?? 0} clicks
                      </span>
                      <span>{formatRelativeTime(club.createdAt)}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          club.status === "live"
                            ? "bg-green-50 text-green-600"
                            : club.status === "flagged"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {club.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === club.id ? null : club.id)
                      }
                      className="p-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <HugeiconsIcon
                        icon={MoreVerticalIcon}
                        strokeWidth={1.5}
                        size={18}
                        className="text-gray-400"
                      />
                    </button>

                    <AnimatePresence>
                      {openMenu === club.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-10 z-dropdown bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 w-40"
                        >
                          <button
                            onClick={() => {
                              toggleAnalytics(club.id);
                              setOpenMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <HugeiconsIcon
                              icon={AnalyticsUpIcon}
                              strokeWidth={1.5}
                              size={16}
                            />
                            Analytics
                          </button>
                          <button
                            onClick={() => {
                              setEditingClub(club);
                              setShowPostModal(true);
                              setOpenMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <HugeiconsIcon
                              icon={Edit01Icon}
                              strokeWidth={1.5}
                              size={16}
                            />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeletingClub(club);
                              setOpenMenu(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <HugeiconsIcon
                              icon={Delete01Icon}
                              strokeWidth={1.5}
                              size={16}
                            />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Analytics panel (expandable) */}
                <AnimatePresence>
                  {analyticsClubId === club.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-50 overflow-hidden"
                    >
                      <div className="p-4">
                        <ClubAnalyticsPanel
                          clubId={club.id}
                          analytics={analytics}
                          isLoading={analyticsLoading}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <PostClubModal
        isOpen={showPostModal}
        onClose={() => {
          setShowPostModal(false);
          setEditingClub(null);
        }}
        onSubmit={handlePost}
        isSubmitting={
          editingClub ? updateMutation.isPending : createMutation.isPending
        }
        editingClub={editingClub}
      />
      <DeleteClubModal
        isOpen={!!deletingClub}
        onClose={() => setDeletingClub(null)}
        onConfirm={handleDelete}
        clubName={deletingClub?.name}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
};

export default MyClubs;
