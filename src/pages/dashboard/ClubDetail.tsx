import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Link04Icon,
  UserGroupIcon,
  EyeIcon,
  Alert02Icon,
  Share01Icon,
  Target01Icon,
  Edit01Icon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/hooks/useAuth";
import {
  useClub,
  useTrackClubClick,
  useFlagClub,
  useRequestClub,
} from "@/hooks/useClubs";
import { FlagClubModal, RequestClubModal } from "@/components/clubs";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

const ClubDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: club, isLoading } = useClub(id);
  const clickMutation = useTrackClubClick();
  const flagMutation = useFlagClub();
  const requestMutation = useRequestClub();

  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleJoin = useCallback(() => {
    if (!club) return;
    if (!user) {
      navigate(`/auth/signin?redirect=/clubs/${club.id}`);
      return;
    }
    clickMutation.mutate(club.id, {
      onSuccess: (res) => {
        if (res.status === "success") {
          window.open(res.data.externalLink, "_blank", "noopener");
        } else {
          window.open(club.externalLink, "_blank", "noopener");
        }
      },
      onError: () => {
        window.open(club.externalLink, "_blank", "noopener");
      },
    });
  }, [club, user, navigate, clickMutation]);

  const handleFlag = (reason: string) => {
    if (!club) return;
    flagMutation.mutate(
      { clubId: club.id, reason },
      { onSuccess: () => setShowFlagModal(false) },
    );
  };

  const handleRequest = (data: {
    name: string;
    interest: string;
    message?: string;
  }) => {
    requestMutation.mutate(data, {
      onSuccess: () => setShowRequestModal(false),
    });
  };

  const handleShare = () => {
    if (!club) return;
    const url = `${window.location.origin}/clubs/${club.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const isOrganizer = !!user && user.id === club?.organizerId;

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-gray-100 rounded" />
          <div className="h-48 bg-gray-100 rounded-2xl" />
          <div className="h-8 w-2/3 bg-gray-100 rounded" />
          <div className="h-4 w-full bg-gray-50 rounded" />
          <div className="h-4 w-3/4 bg-gray-50 rounded" />
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HugeiconsIcon
            icon={UserGroupIcon}
            strokeWidth={1.5}
            size={32}
            className="text-gray-400"
          />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Club Not Found
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          This club may have been removed or the link is incorrect.
        </p>
        <button
          onClick={() => navigate("/clubs")}
          className="text-sm font-medium text-brand hover:underline"
        >
          Browse all clubs
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-12">
        {/* Back button */}
        <button
          onClick={() => navigate("/clubs")}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} size={18} />
          Back to Clubs
        </button>

        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden bg-gradient-to-br from-brand/10 to-brand/5 h-44 sm:h-56 mb-6"
        >
          {club.imageUrl ? (
            <img
              src={club.imageUrl}
              alt={club.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <HugeiconsIcon
                icon={UserGroupIcon}
                strokeWidth={1}
                size={64}
                className="text-brand/20"
              />
            </div>
          )}
        </motion.div>

        {/* Title row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {club.name}
            </h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isOrganizer && (
                <button
                  onClick={() => navigate("/clubs/my")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-brand/30 bg-brand/5 text-brand text-xs font-medium hover:bg-brand/10 transition-colors"
                  title="Manage this club in My Clubs"
                >
                  <HugeiconsIcon
                    icon={Edit01Icon}
                    strokeWidth={1.5}
                    size={14}
                  />
                  Edit Club
                </button>
              )}
              <button
                onClick={handleShare}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                title="Copy link"
              >
                <HugeiconsIcon
                  icon={Share01Icon}
                  strokeWidth={1.5}
                  size={18}
                  className="text-gray-500"
                />
              </button>
              {user && !isOrganizer && (
                <button
                  onClick={() => setShowFlagModal(true)}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors"
                  title="Report"
                >
                  <HugeiconsIcon
                    icon={Alert02Icon}
                    strokeWidth={1.5}
                    size={18}
                    className="text-gray-500 hover:text-red-500"
                  />
                </button>
              )}
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1">
              <HugeiconsIcon icon={EyeIcon} strokeWidth={1.5} size={14} />
              {club.clickCount ?? 0} clicks
            </span>
            <span>·</span>
            <span>{formatRelativeTime(club.createdAt)}</span>
            {club.targeting !== "public" && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1 text-xs font-medium text-brand bg-brand/8 px-2 py-0.5 rounded-full">
                  <HugeiconsIcon
                    icon={Target01Icon}
                    strokeWidth={1.5}
                    size={12}
                  />
                  {club.targeting === "specific" ? "Targeted" : "Filtered"}
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Interests */}
        {(club.interests?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {club.interests!.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-3 py-1 rounded-full bg-brand/8 text-brand"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="prose prose-sm max-w-none mb-8">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {club.description}
          </p>
        </div>

        {/* Target departments */}
        {club.targetDepartments && club.targetDepartments.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-8">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {club.targeting === "specific" ? "For:" : "Excludes:"}
            </h4>
            <div className="flex flex-wrap gap-2">
              {club.targetDepartments.map((td) => (
                <span
                  key={td.departmentId}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700"
                >
                  {td.department.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Organizer */}
        {club.organizer && (
          <div className="flex items-center gap-3 mb-8 p-4 bg-gray-50 rounded-2xl">
            {club.organizer.profilePicture ? (
              <img
                src={club.organizer.profilePicture}
                alt={club.organizer.firstName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-sm font-semibold text-brand">
                {club.organizer.firstName?.[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {club.organizer.firstName} {club.organizer.lastName}
              </p>
              {club.organizer.department && (
                <p className="text-xs text-gray-500">
                  {club.organizer.department.name}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Join CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleJoin}
            className="flex-1 inline-flex items-center justify-center gap-2 text-base font-medium text-white bg-brand rounded-xl px-6 py-3.5 hover:bg-brand/90 transition-colors shadow-sm"
          >
            <HugeiconsIcon icon={Link04Icon} strokeWidth={1.5} size={18} />
            Join Now
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl px-5 py-3 hover:bg-gray-50 transition-colors"
          >
            Request Similar Club
          </button>
        </div>
      </div>

      {/* Modals */}
      <FlagClubModal
        isOpen={showFlagModal}
        onClose={() => setShowFlagModal(false)}
        onSubmit={handleFlag}
        clubName={club.name}
        isSubmitting={flagMutation.isPending}
      />
      <RequestClubModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleRequest}
        isSubmitting={requestMutation.isPending}
      />
    </>
  );
};

export default ClubDetail;
