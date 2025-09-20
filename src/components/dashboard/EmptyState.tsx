import React from 'react';
import { motion } from 'framer-motion';
import { Search01Icon, UploadSquare01Icon, Bookmark01Icon, Folder01Icon, Home01Icon, ArrowRight01Icon } from 'hugeicons-react';

interface EmptyStateProps {
  type: 'recent' | 'recommendations' | 'libraries' | 'saved' | 'uploads';
  onAction?: () => void;
  isLoading?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction, isLoading = false }) => {
  const getContent = () => {
    switch (type) {
      case 'recent':
        return {
          icon: <Home01Icon size={48} className="text-gray-400" />,
          title: "No Recent Materials",
          description: "You haven't viewed any materials recently. Start exploring to see your recent activity here.",
          actionText: "Browse Materials",
          actionIcon: <ArrowRight01Icon size={16} />
        };
      case 'saved':
        return {
          icon: <Bookmark01Icon size={48} className="text-gray-400" />,
          title: "No Saved Materials",
          description: "You haven't saved any materials yet. Start exploring and save materials you find useful.",
          actionText: "Browse Materials",
          actionIcon: <ArrowRight01Icon size={16} />
        };
      case 'uploads':
        return {
          icon: <UploadSquare01Icon size={48} className="text-gray-400" />,
          title: "No Uploads Yet",
          description: "You haven't uploaded any materials yet. Share your knowledge with the community.",
          actionText: "Upload Material",
          actionIcon: <UploadSquare01Icon size={16} />
        };
      case 'libraries':
        return {
          icon: <Folder01Icon size={48} className="text-gray-400" />,
          title: "Your Library is Empty",
          description: "Start building your personal library by saving materials and uploading your own content.",
          actionText: "Upload Material",
          actionIcon: <UploadSquare01Icon size={16} />
        };
      default:
        return {
          icon: <Search01Icon size={48} className="text-gray-400" />,
          title: "No Results Found",
          description: "Try adjusting your search or filters to find what you're looking for.",
          actionText: "Clear Filters",
          actionIcon: <Search01Icon size={16} />
        };
    }
  };

  const content = getContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 p-4 bg-gray-50 rounded-full"
      >
        {content.icon}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="text-xl font-semibold text-gray-900 mb-2"
      >
        {content.title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="text-gray-600 mb-8 max-w-md leading-relaxed"
      >
        {content.description}
      </motion.p>

      {/* Action Button */}
      {onAction && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          onClick={onAction}
          disabled={isLoading}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors duration-200 font-medium ${
            isLoading 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-brand text-white hover:bg-brand/90'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
              Loading...
            </>
          ) : (
            <>
              {content.actionIcon}
              {content.actionText}
            </>
          )}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
