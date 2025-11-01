import React from 'react';
import { motion } from 'framer-motion';
import { Search01Icon, UploadSquare01Icon, Bookmark01Icon, Folder01Icon, Home01Icon, ArrowRight01Icon, UserCircleIcon } from 'hugeicons-react';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  type: 'recent' | 'recommendations' | 'libraries' | 'saved' | 'uploads';
  onAction?: () => void;
  isLoading?: boolean;
}

type EmptyStateContent = {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionText: string;
  actionIcon: React.ReactNode;
};

const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction, isLoading = false }) => {
  const navigate = useNavigate();

  const getContent = (): EmptyStateContent => {
    switch (type) {
      case 'recent':
        return {
          Icon: Home01Icon,
          title: "No Recent Materials",
          description: "You haven't viewed any materials recently. Start exploring to see your recent activity here.",
          actionText: "Browse Materials",
          actionIcon: <ArrowRight01Icon size={16} />
        };
      case 'recommendations':
        return {
          Icon: UserCircleIcon,
          title: "No Recommendations Available",
          description: "Complete your profile by adding your department, level, and courses to get personalized material recommendations tailored to your studies.",
          actionText: "Complete Profile",
          actionIcon: <ArrowRight01Icon size={16} />
        };
      case 'saved':
        return {
          Icon: Bookmark01Icon,
          title: "No Saved Materials",
          description: "You haven't saved any materials yet. Start exploring and save materials you find useful.",
          actionText: "Browse Materials",
          actionIcon: <ArrowRight01Icon size={16} />
        };
      case 'uploads':
        return {
          Icon: UploadSquare01Icon,
          title: "No Uploads Yet",
          description: "You haven't uploaded any materials yet. Share your knowledge with the community.",
          actionText: "Upload Material",
          actionIcon: <UploadSquare01Icon size={16} />
        };
      case 'libraries':
        return {
          Icon: Folder01Icon,
          title: "Your Library is Empty",
          description: "Start building your personal library by saving materials and uploading your own content.",
          actionText: "Upload Material",
          actionIcon: <UploadSquare01Icon size={16} />
        };
      default:
        return {
          Icon: Search01Icon,
          title: "No Results Found",
          description: "Try adjusting your search or filters to find what you're looking for.",
          actionText: "Clear Filters",
          actionIcon: <Search01Icon size={16} />
        };
    }
  };

  const handleAction = () => {
    if (type === 'recommendations') {
      navigate('/dashboard/settings');
    } else if (onAction) {
      onAction();
    }
  };

  const content = getContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 px-4 text-center"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-3 sm:mb-4 md:mb-6 p-2 sm:p-3 md:p-4 bg-gray-50 rounded-full"
      >
        <content.Icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-gray-400" />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2"
      >
        {content.title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 md:mb-8 max-w-md leading-relaxed px-2"
      >
        {content.description}
      </motion.p>

      {/* Action Button */}
      {(onAction || type === 'recommendations') && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          onClick={handleAction}
          disabled={isLoading}
          className={`inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg transition-colors duration-200 text-sm sm:text-base font-medium ${
            isLoading 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-brand text-white hover:bg-brand/90'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs sm:text-sm">Loading...</span>
            </>
          ) : (
            <>
              <span className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0">{content.actionIcon}</span>
              <span>{content.actionText}</span>
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
