import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Alert02Icon } from "@hugeicons/core-free-icons";

interface FlagClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  clubName?: string;
  isSubmitting?: boolean;
}

const FlagClubModal: React.FC<FlagClubModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  clubName,
  isSubmitting = false,
}) => {
  const [reason, setReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");

  const predefinedReasons = [
    "Spam or misleading",
    "Inappropriate content",
    "Broken or suspicious link",
    "Duplicate club",
    "No longer active",
  ];

  const finalReason =
    selectedReason === "Other" ? reason : selectedReason || reason;

  const handleSubmit = () => {
    if (!finalReason.trim()) return;
    onSubmit(finalReason);
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
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
                  <HugeiconsIcon
                    icon={Alert02Icon}
                    strokeWidth={1.5}
                    size={28}
                    className="text-red-500"
                  />
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 text-center mb-1">
                Report Club
              </h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                {clubName ? (
                  <>
                    Flag{" "}
                    <span className="font-medium text-gray-700">
                      {clubName}
                    </span>{" "}
                    for review
                  </>
                ) : (
                  "Help us keep the community safe."
                )}
              </p>

              <div className="space-y-2 mb-4">
                {predefinedReasons.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${
                      selectedReason === r
                        ? "border-brand bg-brand/5"
                        : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="flag-reason"
                      checked={selectedReason === r}
                      onChange={() => setSelectedReason(r)}
                      className="text-brand focus:ring-brand/30"
                    />
                    <span className="text-sm text-gray-700">{r}</span>
                  </label>
                ))}
                <label
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${
                    selectedReason === "Other"
                      ? "border-brand bg-brand/5"
                      : "border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="flag-reason"
                    checked={selectedReason === "Other"}
                    onChange={() => setSelectedReason("Other")}
                    className="text-brand focus:ring-brand/30"
                  />
                  <span className="text-sm text-gray-700">Other</span>
                </label>
              </div>

              {selectedReason === "Other" && (
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe the issue..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 resize-none transition-all mb-4"
                />
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!finalReason.trim() || isSubmitting}
                  className="flex-1 px-4 py-3 text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={Alert02Icon}
                        strokeWidth={1.5}
                        size={16}
                      />
                      Report
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

export default FlagClubModal;
