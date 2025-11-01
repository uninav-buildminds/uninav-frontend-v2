import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cancel01Icon, ArrowRight02Icon, UserCircleIcon } from "hugeicons-react";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";
import MobileMenuButton from "./MobileMenuButton";
import MobilePanel from "./MobilePanel";
import { useFullscreen } from "@/context/FullscreenContext";
import { useAuth } from "@/hooks/useAuth";
import { isProfileIncomplete } from "@/utils/profile.utils";

const DashboardShell: React.FC = () => {
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { isFullscreen } = useFullscreen();
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const profileIncomplete = isProfileIncomplete(user);
  const [showDesktopBanner, setShowDesktopBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  
  // Hide mobile menu and bottom nav on MaterialView page
  const isMaterialView = location.pathname.includes("/dashboard/material/");

  // Show desktop banner at intervals when profile is incomplete
  useEffect(() => {
    if (isFullscreen || isMaterialView || !profileIncomplete || bannerDismissed) return;

    // Show banner after 3 seconds
    const initialTimer = setTimeout(() => {
      setShowDesktopBanner(true);
    }, 3000);

    // Auto-dismiss after 4 seconds
    const dismissTimer = setTimeout(() => {
      setShowDesktopBanner(false);
    }, 7000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(dismissTimer);
    };
  }, [isFullscreen, isMaterialView, profileIncomplete, bannerDismissed, location.pathname]);

  // Reset banner when navigating
  useEffect(() => {
    setShowDesktopBanner(false);
    const resetTimer = setTimeout(() => {
      setBannerDismissed(false);
    }, 30000);
    return () => clearTimeout(resetTimer);
  }, [location.pathname]);

  const handleBannerClick = () => {
    navigate("/dashboard/settings");
    setShowDesktopBanner(false);
  };

  const handleDismissBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDesktopBanner(false);
    setBannerDismissed(true);
  };

  const handleMobilePanelToggle = () => {
    setIsMobilePanelOpen(!isMobilePanelOpen);
  };

  const handleMobilePanelClose = () => {
    setIsMobilePanelOpen(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    // TODO: hook into auth
    console.log("logout confirmed");
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Desktop Profile Banner - Toast from top */}
      <AnimatePresence>
        {showDesktopBanner && profileIncomplete && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={handleBannerClick}
            className="hidden md:block fixed top-4 right-4 z-toast w-full max-w-md cursor-pointer"
          >
            <div className="relative">
              <button
                onClick={handleDismissBanner}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center z-10"
                aria-label="Dismiss"
              >
                <Cancel01Icon size={12} className="text-gray-400" />
              </button>
              <div className="rounded-lg bg-white border border-gray-200 p-3 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center">
                  <UserCircleIcon size={14} className="text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700">
                    Complete your profile for personalized recommendations
                  </p>
                </div>
                  <ArrowRight02Icon size={14} className="text-brand flex-shrink-0" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="md:flex">
        {/* Hide sidebar when in fullscreen mode */}
        {!isFullscreen && <Sidebar />}
        <main className="flex-1 min-h-screen overflow-x-hidden">
          {/* Mobile Menu Button - hide in fullscreen and on MaterialView */}
          {!isFullscreen && !isMaterialView && (
            <MobileMenuButton
              isOpen={isMobilePanelOpen}
              onClick={handleMobilePanelToggle}
              disabled={showLogoutModal}
              hidden={false}
            />
          )}

          {/* Tiny fixed outer spacing (persists when scrolling) */}
          <div
            className={`h-screen ${
              isFullscreen
                ? "pt-2 sm:pt-3 px-2 sm:px-3 pb-2"
                : isMaterialView
                ? "pt-2 sm:pt-3 px-2 sm:px-3 pb-2"
                : "pt-2 sm:pt-3 px-2 sm:px-3 pb-24 md:pb-2"
            }`}
          >
            <div
              className={`${
                isFullscreen
                  ? "h-[calc(100vh-0.5rem)] sm:h-[calc(100vh-0.75rem)] rounded-t-3xl safari-rounded-top safari-accelerated"
                  : isMaterialView
                  ? "h-[calc(100vh-0.5rem)] sm:h-[calc(100vh-0.75rem)] md:h-[calc(100vh-0.5rem)] lg:h-[calc(100vh-0.75rem)] rounded-t-3xl safari-rounded-top safari-accelerated"
                  : "h-[calc(100vh-0.5rem)] sm:h-[calc(100vh-0.75rem)] md:h-[calc(100vh-0.5rem)] lg:h-[calc(100vh-0.75rem)] rounded-t-3xl safari-rounded-top safari-accelerated"
              } bg-white border shadow-sm overflow-y-auto scroll-surface`}
            >
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - hide in fullscreen and on MaterialView */}
      {!isFullscreen && !isMaterialView && <MobileBottomNav />}

      {/* Mobile Panel - hide in fullscreen and on MaterialView */}
      {!isFullscreen && !isMaterialView && (
        <MobilePanel
          isOpen={isMobilePanelOpen}
          onClose={handleMobilePanelClose}
          onLogout={handleLogout}
          showLogoutModal={showLogoutModal}
          onConfirmLogout={handleConfirmLogout}
          onCancelLogout={handleCancelLogout}
        />
      )}
    </div>
  );
};

export default DashboardShell;
