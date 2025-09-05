import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logout01Icon, Cancel01Icon } from "hugeicons-react";
import { LogoutModal } from "@/components/modals";

interface MobilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  showLogoutModal: boolean;
  onConfirmLogout: () => void;
  onCancelLogout: () => void;
}

const MobilePanel: React.FC<MobilePanelProps> = ({
  isOpen,
  onClose,
  onLogout,
  showLogoutModal,
  onConfirmLogout,
  onCancelLogout
}) => {
  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal-backdrop md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-modal md:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <img src="/assets/logo.svg" className="h-6" alt="UniNav" />
                  <span className="font-semibold text-brand">UniNav</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Cancel01Icon size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Announcement */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2">Announcement</h4>
                  <div className="h-24 rounded-xl border bg-white/70" />
                </div>

                {/* Recents */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">Recents</h4>
                    <span className="text-xs text-brand">View All</span>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-700">
                    <li>Upload CSC 201 Note</li>
                    <li>Download MTH 202</li>
                    <li>Saved CSC 201 Lecture</li>
                    <li>Viewed CSC 201 Lecture</li>
                    <li>Upload CSC 201 Lecture</li>
                  </ul>
                </div>
              </div>

              {/* User Info - Fixed at Bottom */}
              <div className="border-t pt-4 px-6 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src="https://i.pravatar.cc/80?img=12" 
                    className="w-10 h-10 rounded-full" 
                    alt="User" 
                  />
                  <div>
                    <p className="text-sm font-semibold">Tee Daniels</p>
                    <p className="text-xs text-muted-foreground">tee@uninav.edu</p>
                  </div>
                </div>
                
                <button 
                  onClick={onLogout}
                  className="w-full text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors"
                >
                  <Logout01Icon size={16} />
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={onCancelLogout}
        onConfirm={onConfirmLogout}
        userName="Tee"
      />
    </>
  );
};

export default MobilePanel;
