import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";
import MobileMenuButton from "./MobileMenuButton";
import MobilePanel from "./MobilePanel";

const DashboardShell: React.FC = () => {
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-x-hidden">
          {/* Mobile Menu Button */}
          <MobileMenuButton
            isOpen={isMobilePanelOpen}
            onClick={handleMobilePanelToggle}
            disabled={showLogoutModal}
            hidden={false}
          />

          {/* Tiny fixed outer spacing (persists when scrolling) */}
          <div className="pt-2 sm:pt-3 px-2 sm:px-3 h-screen pb-24 md:pb-2">
            <div className="h-[calc(100vh-0.5rem)] sm:h-[calc(100vh-0.75rem)] md:h-[calc(100vh-0.5rem)] lg:h-[calc(100vh-0.75rem)] rounded-t-3xl safari-rounded-top safari-accelerated bg-white border shadow-sm overflow-y-auto scroll-surface">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Mobile Panel */}
      <MobilePanel
        isOpen={isMobilePanelOpen}
        onClose={handleMobilePanelClose}
        onLogout={handleLogout}
        showLogoutModal={showLogoutModal}
        onConfirmLogout={handleConfirmLogout}
        onCancelLogout={handleCancelLogout}
      />
    </div>
  );
};

export default DashboardShell;
