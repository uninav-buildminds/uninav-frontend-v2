import React, { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  UserGroupIcon,
  Search01Icon,
  DashboardSquare02Icon,
  Cancel01Icon,
  Menu01Icon,
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
    searchParams.get("interest") || ""
  );
  const [page, setPage] = useState(1);

  // Modal state
  const [showPostModal, setShowPostModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);

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
    [clickMutation]
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
      {/* Mobile sidebar panel */}
      <AnimatePresence>
        {showMobilePanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-mobile-panel sm:hidden"
              onClick={() => setShowMobilePanel(false)}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-mobile-panel sm:hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
                <Link
                  to="/home"
                  onClick={() => setShowMobilePanel(false)}
                  className="flex items-center gap-2.5"
                >
                  <img src="/assets/logo.svg" alt="UniNav" className="h-6 w-6" />
                  <span className="font-semibold text-brand text-base">UniNav</span>
                </Link>
                <button
                  onClick={() => setShowMobilePanel(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Nav items */}
              <div className="flex-1 px-3 py-4">
                {user && (
                  <button
                    onClick={() => {
                      navigate("/clubs/my");
                      setShowMobilePanel(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand/5 hover:text-brand transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <HugeiconsIcon icon={DashboardSquare02Icon} strokeWidth={1.5} size={16} className="text-brand" />
                    </div>
                    Manage Clubs
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Fixed logo — same as GuidesPage */}
      <Link
        to="/home"
        className="fixed left-3 sm:left-4 top-3 sm:top-4 z-fixed flex items-center gap-1.5 sm:gap-2 px-2.5 py-2 sm:px-3 sm:py-2.5 bg-white/90 backdrop-blur hover:bg-white border border-gray-200 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Go to UniNav home"
      >
        <img src="/assets/logo.svg" alt="" className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
        <span className="text-sm sm:text-base font-semibold text-brand hidden sm:inline">UniNav</span>
      </Link>

      {/* Header with gradient — matches PageHeader pattern */}
      <section className="relative overflow-visible z-sticky">
        <div className="bg-gradient-to-br from-[theme(colors.dashboard.gradientFrom)] to-[theme(colors.dashboard.gradientTo)]">
          <div className="px-2 sm:px-4 pt-16 sm:pt-20 pb-6 sm:pb-8">
            {/* Mobile hamburger */}
            {user && (
              <button
                onClick={() => setShowMobilePanel(true)}
                className="sm:hidden absolute top-4 left-4 p-3 bg-white rounded-2xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors z-10"
                aria-label="Open menu"
              >
                <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.5} size={20} className="text-gray-700" />
              </button>
            )}
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground">
                Find Your Community
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-lg mx-auto">
                Discover clubs, communities, and student organizations across
                campus.
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
        <div className="flex items-center justify-between mb-6 gap-2">
          <p className="text-sm text-gray-500 shrink-0">
            {pagination
              ? `${pagination.totalItems} club${
                  pagination.totalItems !== 1 ? "s" : ""
                } found`
              : "\u00A0"}
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={() => setShowRequestModal(true)}
              className="text-xs font-medium text-gray-600 hover:text-brand px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Request a Club</span>
              <span className="sm:hidden">Request a Club</span>
            </button>
            {user && (
              <>
                <button
                  onClick={() => navigate("/clubs/my")}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
                  title="Manage clubs you've posted"
                >
                  <HugeiconsIcon icon={DashboardSquare02Icon} strokeWidth={1.5} size={14} />
                  Manage Clubs
                </button>
                <button
                  onClick={() => setShowPostModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-brand px-3 sm:px-4 py-2 rounded-xl hover:bg-brand/90 transition-colors shadow-sm whitespace-nowrap"
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} size={14} />
                  <span className="hidden sm:inline">Post Club</span>
                  <span className="sm:hidden">+ Post Club</span>
                </button>
              </>
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
                <ClubCard key={club.id} club={club} onJoin={handleJoin} isAuthenticated={!!user} />
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
