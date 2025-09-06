import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logout01Icon, Cancel01Icon } from "hugeicons-react";
import { LogoutModal } from "@/components/modals";
import { panelData } from "@/data/panel";

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
  // Close panel when logout modal opens
  useEffect(() => {
    if (showLogoutModal && isOpen) {
      onClose();
    }
  }, [showLogoutModal, isOpen, onClose]);
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-mobile-panel md:hidden"
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
            className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-mobile-panel md:hidden"
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
                  <h4 className="text-sm font-semibold mb-2">{panelData.announcement.title}</h4>
                  <div className="h-24 rounded-xl border bg-white/70 p-3 flex items-center justify-center">
                    <p className="text-xs text-gray-600 text-center">{panelData.announcement.content}</p>
                  </div>
                </div>

                {/* Recents */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">{panelData.recents.title}</h4>
                    <span className="text-xs text-brand">{panelData.recents.viewAllText}</span>
                  </div>
                  <ul className="space-y-1 text-xs text-gray-700">
                    {panelData.recents.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* User Info - Fixed at Bottom */}
              <div className="border-t pt-4 px-6 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={panelData.user.avatar} 
                    className="w-10 h-10 rounded-full" 
                    alt="User" 
                  />
                  <div>
                    <p className="text-sm font-semibold">{panelData.user.name}</p>
                    <p className="text-xs text-muted-foreground">{panelData.user.email}</p>
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
        userName={panelData.user.name.split(' ')[0]}
      />
    </>
  );
};

export default MobilePanel;
