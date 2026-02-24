import React, { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  UserGroupIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/hooks/useAuth";
import {
  useClubs,
  useCreateClub,
  useRequestClub,
  useTrackClubClick,
} from "@/hooks/useClubs";
import {
  ClubCard,
  ClubCardSkeleton,
  ClubsEmptyState,
  ClubsFilterBar,
  PostClubModal,
  RequestClubModal,
} from "@/components/clubs";
import { Club, CreateClubDto } from "@/lib/types/club.types";
import { trackClubClick } from "@/api/clubs.api";

const ClubsFeed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Filter state — synced to URL
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [activeInterest, setActiveInterest] = useState(
    searchParams.get("interest") || "",
  );
  const [page, setPage] = useState(1);

  // Modal state
  const [showPostModal, setShowPostModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Debounced search
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Sync URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.q = debouncedSearch;
    if (activeInterest) params.interest = activeInterest;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, activeInterest]);

  // Fetch clubs
  const { data, isLoading } = useClubs({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    interest: activeInterest || undefined,
  });

  const clubs = data?.clubs ?? [];
  const pagination = data?.pagination;

  // Mutations
  const createClubMutation = useCreateClub();
  const requestClubMutation = useRequestClub();
  const clickMutation = useTrackClubClick();

  const handleJoin = useCallback(
    (club: Club) => {
      // Track the click, then redirect
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
    },
    [clickMutation],
  );

  const handlePostClub = (dto: CreateClubDto) => {
    createClubMutation.mutate(dto, {
      onSuccess: () => setShowPostModal(false),
    });
  };

  const handleRequestClub = (data: {
    name: string;
    interest: string;
    message?: string;
  }) => {
    requestClubMutation.mutate(data, {
      onSuccess: () => setShowRequestModal(false),
    });
  };

  const handleInterestChange = (interest: string) => {
    setActiveInterest(interest);
    setPage(1);
  };

  return (
    <>
      {/* Header with gradient — matches PageHeader pattern */}
      <section className="relative overflow-visible z-sticky">
        <div className="bg-gradient-to-br from-[theme(colors.dashboard.gradientFrom)] to-[theme(colors.dashboard.gradientTo)]">
          <div className="px-2 sm:px-4 pt-16 sm:pt-20 pb-6 sm:pb-8">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-brand/10 text-brand text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <HugeiconsIcon
                  icon={UserGroupIcon}
                  strokeWidth={1.5}
                  size={14}
                />
                Discover Clubs
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground">
                Find Your Community
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-lg mx-auto">
                Discover clubs, communities, and student organizations across
                campus. Join with a single click.
              </p>

              {/* Search + filters */}
              <div className="mt-6 max-w-2xl mx-auto">
                <ClubsFilterBar
                  search={search}
                  onSearchChange={setSearch}
                  activeInterest={activeInterest}
                  onInterestChange={handleInterestChange}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-10 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Action bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {pagination
              ? `${pagination.totalItems} club${pagination.totalItems !== 1 ? "s" : ""} found`
              : "\u00A0"}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRequestModal(true)}
              className="text-xs font-medium text-gray-600 hover:text-brand px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
            >
              Request a Club
            </button>
            {user && (
              <button
                onClick={() => setShowPostModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-brand px-4 py-2 rounded-xl hover:bg-brand/90 transition-colors shadow-sm"
              >
                <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} size={14} />
                Post Club
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ClubCardSkeleton key={i} />
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <ClubsEmptyState
            type={debouncedSearch || activeInterest ? "no-results" : "no-clubs"}
            onAction={
              debouncedSearch || activeInterest
                ? () => {
                    setSearch("");
                    setActiveInterest("");
                  }
                : user
                  ? () => setShowPostModal(true)
                  : undefined
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubs.map((club) => (
                <ClubCard key={club.id} club={club} onJoin={handleJoin} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={!pagination.hasMore}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <PostClubModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={handlePostClub}
        isSubmitting={createClubMutation.isPending}
      />
      <RequestClubModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleRequestClub}
        isSubmitting={requestClubMutation.isPending}
      />
    </>
  );
};

export default ClubsFeed;
