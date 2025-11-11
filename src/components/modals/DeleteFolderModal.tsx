import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete02Icon, Cancel01Icon, Alert02Icon } from 'hugeicons-react';

interface DeleteFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  folderName?: string;
}

export const DeleteFolderModal: React.FC<DeleteFolderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  folderName = "this folder"
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-modal-backdrop flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 z-modal"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 z-10"
            >
              <Cancel01Icon size={20} className="text-gray-500" />
            </button>

            {/* Modal content */}
            <div className="p-6 pt-8">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                  <Alert02Icon size={32} className="text-red-500" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Delete Folder
              </h2>

              {/* Description */}
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <span className="font-medium">"{folderName}"</span>? 
                This action cannot be undone and all materials in this folder will be removed.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-3 text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <Delete02Icon size={18} />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

