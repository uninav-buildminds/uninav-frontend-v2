import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  Link04Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import {
  ClubCard,
  ClubCardSkeleton,
  ClubsEmptyState,
  ClubsFilterBar,
} from "@/components/clubs";
import { useClubs, useTrackClubClick } from "@/hooks/useClubs";
import { Club } from "@/lib/types/club.types";

/**
 * Public clubs discovery page — accessible without authentication.
 * Shows club feed with search/filter, but "Join Now" still tracks clicks.
 */
const PublicClubsFeed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [activeInterest, setActiveInterest] = useState(
    searchParams.get("interest") || "",
  );
  const [page, setPage] = useState(1);

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

  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.q = debouncedSearch;
    if (activeInterest) params.interest = activeInterest;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, activeInterest]);

  const { data, isLoading } = useClubs({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    interest: activeInterest || undefined,
  });
  const clubs = data?.clubs ?? [];
  const pagination = data?.pagination;

  const clickMutation = useTrackClubClick();

  const handleJoin = (club: Club) => {
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
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Floating header */}
      <header className="fixed top-0 inset-x-0 z-fixed bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src="/assets/logo.svg" className="h-6" alt="UniNav" />
            <span className="text-sm font-semibold text-gray-900">UniNav</span>
          </div>
          <button
            onClick={() => navigate("/auth/signin")}
            className="text-sm font-medium text-white bg-brand px-4 py-2 rounded-xl hover:bg-brand/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-8 px-4 bg-gradient-to-br from-[#DCDFFE] to-[#E6FAEE]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} size={14} />
            Club Discovery
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Find Your Community
          </h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
            Explore clubs, student organizations, and communities. Join with a
            single click — no account required to browse.
          </p>

          <ClubsFilterBar
            search={search}
            onSearchChange={setSearch}
            activeInterest={activeInterest}
            onInterestChange={(i) => {
              setActiveInterest(i);
              setPage(1);
            }}
          />
        </div>
      </section>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-8">
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

        {/* CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-brand to-[#4045E1] rounded-2xl p-6 sm:p-8 text-center text-white"
        >
          <h3 className="text-xl font-bold mb-2">
            Want to post your own club?
          </h3>
          <p className="text-sm text-white/80 mb-4 max-w-md mx-auto">
            Sign in to post a club, track clicks, and get your community in
            front of targeted students.
          </p>
          <button
            onClick={() => navigate("/auth/signin")}
            className="inline-flex items-center gap-2 bg-white text-brand font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors"
          >
            Get Started
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={1.5}
              size={16}
            />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PublicClubsFeed;
