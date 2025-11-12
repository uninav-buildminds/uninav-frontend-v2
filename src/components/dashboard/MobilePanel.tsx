import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Logout01Icon, Cancel01Icon, ArrowRight02Icon, UserCircleIcon } from "hugeicons-react";
import { LogoutModal } from "@/components/modals";
import { panelData } from "@/data/panel";
import { useAuth } from "@/hooks/useAuth";
import { isProfileIncomplete } from "@/utils/profile.utils";
import RecentsList from "./RecentsList";

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
  onCancelLogout,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profileIncomplete = isProfileIncomplete(user);
  const [showProfileBanner, setShowProfileBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Close panel when logout modal opens
  useEffect(() => {
    if (showLogoutModal && isOpen) {
      onClose();
    }
  }, [showLogoutModal, isOpen, onClose]);

  // Show profile banner when profile is incomplete (keep code but remove auto-dismiss)
  // Banner stays visible until profile is complete
  useEffect(() => {
    if (!isOpen || !profileIncomplete || bannerDismissed) {
      setShowProfileBanner(false);
      return;
    }

    // Show banner when panel opens (no delay, stays visible)
    setShowProfileBanner(true);
  }, [isOpen, profileIncomplete, bannerDismissed]);

  // Reset banner when panel closes
  useEffect(() => {
    if (!isOpen) {
      setShowProfileBanner(false);
      // Reset dismissed state after 30 seconds (so it can show again)
      const resetTimer = setTimeout(() => {
        setBannerDismissed(false);
      }, 30000);
      return () => clearTimeout(resetTimer);
    }
  }, [isOpen]);

  const handleBannerClick = () => {
    navigate("/dashboard/settings?tab=academic");
    onClose();
  };

  const handleDismissBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfileBanner(false);
    setBannerDismissed(true);
  };
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
                {/* Profile Incomplete Banner */}
                <AnimatePresence>
                  {showProfileBanner && profileIncomplete && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      onClick={handleBannerClick}
                      className="mb-4 relative overflow-hidden rounded-xl bg-gradient-to-r from-brand via-brand/90 to-brand/80 p-4 cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <button
                        onClick={handleDismissBanner}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
                        aria-label="Dismiss"
                      >
                        <Cancel01Icon size={14} className="text-white" />
                      </button>
                      <div className="flex items-start gap-3 pr-6">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <UserCircleIcon size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white mb-1">
                            Complete Your Profile
                          </h4>
                          <p className="text-xs text-white/90 leading-relaxed">
                            Add your department and level to get personalized recommendations
                          </p>
                          <div className="flex items-center gap-1 mt-2">
                            <span className="text-xs text-white/90 font-medium">Complete now</span>
                            <ArrowRight02Icon size={12} className="text-white" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Announcement */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2">
                    {panelData.announcement.title}
                  </h4>
                  <div className="h-24 rounded-xl border bg-white/70 p-3 flex items-center justify-center">
                    <p className="text-xs text-gray-600 text-center">
                      {panelData.announcement.content}
                    </p>
                  </div>
                </div>

                {/* Recents */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">Recents</h4>
                    <button
                      onClick={() => {
                        navigate("/dashboard/recent");
                        onClose();
                      }}
                      className="text-xs text-brand hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <RecentsList limit={5} />
                </div>
              </div>

              {/* User Info - Fixed at Bottom */}
              <div className="border-t pt-4 px-6 pb-6">
                <button
                  onClick={() => {
                    if (user?.id) {
                      navigate(`/dashboard/profile/${user.id}`);
                      onClose();
                    }
                  }}
                  className="w-full flex items-center gap-3 mb-4 relative hover:opacity-80 transition-opacity"
                >
                  <div className="relative">
                    <img
                      src={user?.profilePicture || panelData.user.avatar}
                      className="w-10 h-10 rounded-full object-cover"
                      alt="User"
                    />
                    {/* Profile Incomplete Badge */}
                    {profileIncomplete && (
                      <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-white shadow-md" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold">
                      {user
                        ? `${user.firstName} ${user.lastName}`
                        : panelData.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email || panelData.user.email}
                    </p>
                  </div>
                </button>

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
        userName={user?.firstName || panelData.user.name.split(" ")[0]}
      />
    </>
  );
};

export default MobilePanel;
