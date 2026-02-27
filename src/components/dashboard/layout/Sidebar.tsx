import React, { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  FolderLibraryIcon,
  HelpCircleIcon,
  Home01Icon,
  Logout01Icon,
  Notification01Icon,
  Settings01Icon,
  SidebarLeft01Icon,
  SidebarLeftIcon,
  UserGroupIcon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { UserRail } from "@/components/dashboard/user";
import { LogoutModal, UploadModal } from "@/components/modals";
import { panelData } from "@/data/panel";
import { useAuth } from "@/hooks/useAuth";
import RecentsList from "../lists/RecentsList";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [showPanel, setShowPanel] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { user, logOut } = useAuth();

  // Base navigation items (excluding help)
  const baseNavItems = [
    { to: "/dashboard", label: "Overview", icon: Home01Icon },
    { to: "/dashboard/libraries", label: "Libraries", icon: FolderLibraryIcon },
    {
      to: "/dashboard/notifications",
      label: "Alerts",
      icon: Notification01Icon,
    },
    { to: "/dashboard/settings", label: "Settings", icon: Settings01Icon },
  ];

  // Help item (separate for right positioning)
  const helpItem = {
    to: "/dashboard/help",
    label: "Help",
    icon: HelpCircleIcon,
  };

  // Add management item for admin/moderator users
  const navItems =
    user && (user.role === "admin" || user.role === "moderator")
      ? [
          ...baseNavItems.slice(0, -1), // All except Settings
          { to: "/management", label: "Management", icon: UserGroupIcon },
          ...baseNavItems.slice(-1), // Settings
        ]
      : baseNavItems;

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logOut();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleUpload = () => {
    setShowUploadModal(true);
  };

  const togglePanel = () => {
    setShowPanel(!showPanel);
  };

  const railWidth = 80;
  const panelWidth = 260;

  return (
    <aside
      className="h-screen sticky top-0 hidden md:flex flex-col justify-between border-r p-3"
      style={{
        width: showPanel ? railWidth + panelWidth : railWidth,
        backgroundColor: "#FFFFFF",
        transition: "width 200ms ease",
      }}
    >
      {/* The container flex row holds the rail and the inline panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Rail */}
        <div className="w-[60px] flex-shrink-0">
          <div className="h-full flex flex-col justify-between">
            <div>
              {/* Toggle button */}
              <button
                onClick={togglePanel}
                className="grid place-items-center h-10 w-10 rounded-full mx-auto transition-transform duration-200 hover:scale-105"
                aria-label="Toggle sidebar panel"
              >
                {showPanel ? (
                  <HugeiconsIcon
                    icon={SidebarLeft01Icon}
                    strokeWidth={1.5}
                    size={22}
                    className="text-gray-700 transition-opacity duration-200"
                  />
                ) : (
                  <HugeiconsIcon
                    icon={SidebarLeftIcon}
                    strokeWidth={1.5}
                    size={22}
                    className="text-gray-700 transition-opacity duration-200"
                  />
                )}
              </button>

              {/* New button */}
              <button
                onClick={handleUpload}
                className="mt-4 w-12 h-12 grid place-items-center mx-auto rounded-full bg-brand text-white shadow-sm transition-transform duration-200 hover:scale-105"
                aria-label="New"
              >
                <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} size={20} />
              </button>

              {/* Nav rail */}
              <nav className="mt-6 flex flex-col items-center gap-6">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/dashboard"}
                    className={({ isActive }) =>
                      "flex flex-col items-center gap-1"
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`grid place-items-center h-10 w-10 rounded-2xl transition-all duration-200 hover:scale-105 ${
                            isActive
                              ? "bg-brand text-white shadow-md"
                              : "text-gray-700 hover:bg-[#DCDFFE]"
                          }`}
                        >
                          <HugeiconsIcon
                            icon={Icon}
                            strokeWidth={1.5}
                            size={18}
                          />
                        </div>
                        <span
                          className={`text-[11px] transition-colors ${
                            isActive
                              ? "text-brand font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {label}
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              {/* Help icon positioned separately on the right */}
              <div className="mt-6 flex flex-col items-center gap-4">
                <NavLink
                  to={helpItem.to}
                  className="flex flex-col items-center gap-1"
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`grid place-items-center h-10 w-10 rounded-2xl transition-all duration-200 hover:scale-105 ${
                          isActive
                            ? "bg-brand text-white shadow-md"
                            : "text-gray-700 hover:bg-[#DCDFFE]"
                        }`}
                      >
                        <HugeiconsIcon
                          icon={HelpCircleIcon}
                          strokeWidth={1.5}
                          size={18}
                        />
                      </div>
                      <span
                        className={`text-[11px] transition-colors ${
                          isActive ? "text-brand font-medium" : "text-gray-700"
                        }`}
                      >
                        {helpItem.label}
                      </span>
                    </>
                  )}
                </NavLink>
              </div>
            </div>

            {/* User avatar fixed on rail bottom */}
            <UserRail
              userName={
                user ? user.firstName : panelData.user.name.split(" ")[0]
              }
              avatarUrl={user?.profilePicture}
            />
          </div>
        </div>

        {/* Inline expanding panel */}
        <div
          className="flex-1 overflow-y-auto border-l pl-4 pr-3"
          style={{
            width: showPanel ? panelWidth : 0,
            opacity: showPanel ? 1 : 0,
            transition: "width 200ms ease, opacity 200ms ease",
          }}
        >
          {showPanel && (
            <div className="pr-2 flex flex-col h-full">
              {/* Panel header brand logo restored */}
              <Link to="/home" className="flex items-center gap-2 mb-4 w-fit">
                <img src="/assets/logo.svg" className="h-6" alt="UniNav" />
                <span className="font-semibold text-brand">UniNav</span>
              </Link>

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

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Recents</h4>
                  <button
                    onClick={() => navigate("/dashboard/recent")}
                    className="text-xs text-brand hover:underline"
                  >
                    View All
                  </button>
                </div>
                <RecentsList limit={5} />
              </div>

              {/* User summary at bottom (no avatar) */}
              <div className="mt-6 border-t pt-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user
                      ? `${user.firstName} ${user.lastName}`
                      : panelData.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || panelData.user.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-white bg-red-600 hover:bg-red-700 rounded-md px-3 py-1 flex items-center gap-1"
                >
                  <HugeiconsIcon
                    icon={Logout01Icon}
                    strokeWidth={1.5}
                    size={14}
                  />{" "}
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        userName={user?.firstName || panelData.user.name.split(" ")[0]}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </aside>
  );
};

export default Sidebar;
