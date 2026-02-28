import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Link04Icon,
  UserGroupIcon,
  EyeIcon,
  Copy01Icon,
} from "@hugeicons/core-free-icons";
import { Club } from "@/lib/types/club.types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ClubCardProps {
  club: Club;
  onJoin?: (club: Club) => void;
  isAuthenticated?: boolean;
}

const ClubCard: React.FC<ClubCardProps> = ({ club, onJoin, isAuthenticated }) => {
  const navigate = useNavigate();
  const [showLink, setShowLink] = useState(false);

  const handleCardClick = () => {
    navigate(`/clubs/${club.slug}`);
  };

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;

    // Show the link immediately (synchronous, iOS-safe)
    setShowLink(true);
    // Also call onJoin for tracking + attempt window.open
    onJoin?.(club);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(club.externalLink).then(() => {
      toast.success("Link copied!");
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      onClick={handleCardClick}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Banner / Image */}
      <div className="relative h-36 sm:h-40 bg-gradient-to-br from-brand/10 to-brand/5 overflow-hidden">
        {club.imageUrl ? (
          <img
            src={club.imageUrl}
            alt={club.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HugeiconsIcon
              icon={UserGroupIcon}
              strokeWidth={1}
              size={48}
              className="text-brand/30"
            />
          </div>
        )}

        {/* Click count badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-gray-600 shadow-sm">
          <HugeiconsIcon icon={EyeIcon} strokeWidth={1.5} size={14} />
          <span>{club.clickCount ?? 0}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Tags pills */}
        {(club.interests?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {club.interests!.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand/8 text-brand"
              >
                {tag}
              </span>
            ))}
            {club.interests!.length > 3 && (
              <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                +{club.interests!.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Name & Description */}
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-brand transition-colors">
          {club.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-3 leading-relaxed">
          {club.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4">
          {/* Organizer avatar */}
          {club.organizer && (
            <div className="flex items-center gap-2">
              {club.organizer.profilePicture ? (
                <img
                  src={club.organizer.profilePicture}
                  alt={club.organizer.firstName}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center text-[10px] font-semibold text-brand">
                  {club.organizer.firstName?.[0]}
                </div>
              )}
              <span className="text-xs text-gray-500 truncate max-w-[100px]">
                {club.organizer.firstName} {club.organizer.lastName?.[0]}.
              </span>
            </div>
          )}

          {/* Join Now button */}
          <button
            onClick={handleJoin}
            disabled={!isAuthenticated}
            title={!isAuthenticated ? "Sign in to join" : undefined}
            className={`inline-flex items-center gap-1.5 text-sm font-medium rounded-xl px-4 py-2 transition-colors shadow-sm ${
              isAuthenticated
                ? "text-white bg-brand hover:bg-brand/90"
                : "text-gray-400 bg-gray-100 cursor-not-allowed"
            }`}
          >
            <HugeiconsIcon icon={Link04Icon} strokeWidth={1.5} size={14} />
            Join Now
          </button>
        </div>

        {/* iOS fallback link — shown after join click */}
        <AnimatePresence>
          {showLink && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-[11px] text-gray-500 mb-2">
                  If the page didn't open,{" "}
                  <a
                    href={club.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand font-medium underline underline-offset-2"
                  >
                    tap here to open
                  </a>{" "}
                  or copy the link:
                </p>
                <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-2.5 py-1.5">
                  <span className="text-[11px] text-gray-500 truncate flex-1">
                    {club.externalLink}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 text-gray-400 hover:text-brand transition-colors"
                  >
                    <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.5} size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ClubCard;
