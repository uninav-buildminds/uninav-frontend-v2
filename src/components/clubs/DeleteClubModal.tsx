import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Alert02Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons";

interface DeleteClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clubName?: string;
  isDeleting?: boolean;
}

const DeleteClubModal: React.FC<DeleteClubModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  clubName,
  isDeleting = false,
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
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
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                strokeWidth={1.5}
                size={20}
                className="text-gray-500"
              />
            </button>

            <div className="p-6 pt-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                  <HugeiconsIcon
                    icon={Alert02Icon}
                    strokeWidth={1.5}
                    size={32}
                    className="text-red-500"
                  />
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Delete Club
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete{" "}
                {clubName ? (
                  <span className="font-medium">{clubName}</span>
                ) : (
                  "this club"
                )}
                ? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={Delete01Icon}
                        strokeWidth={1.5}
                        size={18}
                      />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default DeleteClubModal;
