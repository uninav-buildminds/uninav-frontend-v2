import React from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroupIcon, Search01Icon } from "@hugeicons/core-free-icons";

interface ClubsEmptyStateProps {
  type: "no-clubs" | "no-results" | "no-my-clubs";
  onAction?: () => void;
}

const ClubsEmptyState: React.FC<ClubsEmptyStateProps> = ({
  type,
  onAction,
}) => {
  const content = {
    "no-clubs": {
      icon: UserGroupIcon,
      title: "No Clubs Yet",
      description:
        "Be the first to post a club! Help your peers discover communities and opportunities.",
      actionText: "Post a Club",
    },
    "no-results": {
      icon: Search01Icon,
      title: "No Matching Clubs",
      description:
        "Try a different search term or adjust your filters to find clubs you'll love.",
      actionText: "Clear Filters",
    },
    "no-my-clubs": {
      icon: UserGroupIcon,
      title: "You Haven't Posted Any Clubs",
      description:
        "Share your club or community with students across campus. It only takes a minute.",
      actionText: "Post Your First Club",
    },
  };

  const c = content[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-brand/8 flex items-center justify-center mb-5">
        <HugeiconsIcon
          icon={c.icon}
          strokeWidth={1.5}
          size={32}
          className="text-brand"
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1.5">{c.title}</h3>
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-6">
        {c.description}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="bg-brand text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-brand/90 transition-colors shadow-sm"
        >
          {c.actionText}
        </button>
      )}
    </motion.div>
  );
};

export default ClubsEmptyState;
