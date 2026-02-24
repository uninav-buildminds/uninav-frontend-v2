import React from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Link04Icon,
  UserGroupIcon,
  EyeIcon,
} from "@hugeicons/core-free-icons";
import { Club } from "@/lib/types/club.types";
import { useNavigate } from "react-router-dom";

interface ClubCardProps {
  club: Club;
  onJoin?: (club: Club) => void;
}

const ClubCard: React.FC<ClubCardProps> = ({ club, onJoin }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/dashboard/clubs/${club.id}`);
  };

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onJoin?.(club);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      onClick={handleCardClick}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Banner / Image */}
      <div className="relative h-32 sm:h-36 bg-gradient-to-br from-brand/10 to-brand/5 overflow-hidden">
        {club.bannerUrl || club.imageUrl ? (
          <img
            src={club.bannerUrl || club.imageUrl}
            alt={club.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
      <div className="p-4">
        {/* Tags pills */}
        {club.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {club.interests.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand/8 text-brand"
              >
                {tag}
              </span>
            ))}
            {club.interests.length > 3 && (
              <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                +{club.interests.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Name & Description */}
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-brand transition-colors">
          {club.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
          {club.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4">
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
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-brand rounded-xl px-4 py-2 hover:bg-brand/90 transition-colors shadow-sm"
          >
            <HugeiconsIcon icon={Link04Icon} strokeWidth={1.5} size={14} />
            Join Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ClubCard;
