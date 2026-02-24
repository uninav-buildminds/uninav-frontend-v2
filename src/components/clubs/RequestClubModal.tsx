import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { CLUB_INTERESTS } from "@/data/clubs.constants";

interface RequestClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    interest: string;
    message?: string;
  }) => void;
  isSubmitting?: boolean;
}

const RequestClubModal: React.FC<RequestClubModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [name, setName] = useState("");
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !interest) return;
    onSubmit({
      name: name.trim(),
      interest,
      message: message.trim() || undefined,
    });
  };

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
            {/* Close */}
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
                <div className="w-14 h-14 bg-brand/10 rounded-full flex items-center justify-center">
                  <HugeiconsIcon
                    icon={UserGroupIcon}
                    strokeWidth={1.5}
                    size={28}
                    className="text-brand"
                  />
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 text-center mb-1">
                Request a Club
              </h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                Can't find the club you're looking for? Let us know!
              </p>

              <div className="space-y-4">
                {/* Club Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Club Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. AI Research Club"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all"
                  />
                </div>

                {/* Interest */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Related Interest <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all"
                  >
                    <option value="">Select interest...</option>
                    {CLUB_INTERESTS.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Any details about the club you'd like to see..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 resize-none transition-all"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!name.trim() || !interest || isSubmitting}
                  className="flex-1 px-4 py-3 text-white bg-brand rounded-xl hover:bg-brand/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Submit Request"
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

export default RequestClubModal;
