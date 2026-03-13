import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";
import MobileMenuButton from "./MobileMenuButton";
import MobilePanel from "./MobilePanel";
import PWAInstallBanner from "../ui/PWAInstallBanner";
import { useFullscreen } from "@/context/FullscreenContext";
import { useAuth } from "@/hooks/useAuth";
import { isProfileIncomplete } from "@/utils/profile.utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

const DashboardShell: React.FC = () => {
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { isFullscreen } = useFullscreen();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const profileIncomplete = isProfileIncomplete(user);

  // Hide mobile menu and bottom nav on MaterialView page
  const isMaterialView = location.pathname.includes("/dashboard/material/");

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

          {/* Floating home button — desktop only, inside the content card area */}
          {!isFullscreen && !isMaterialView && (
            <button
              onClick={() => navigate("/home")}
              aria-label="Go to home"
              className="hidden md:flex fixed top-6 left-[116px] z-50 items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-150 active:scale-95"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} size={18} className="text-gray-700" />
            </button>
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

      {/* PWA Install Banner - shows after profile is complete */}
      {!isFullscreen && !isMaterialView && (
        <PWAInstallBanner canShow={!profileIncomplete} />
      )}
    </div>
  );
};

export default DashboardShell;
