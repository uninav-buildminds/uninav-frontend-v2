import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home01Icon,
  Bookmark01Icon,
  UploadSquare01Icon,
  Notification01Icon,
  Settings01Icon,
  HelpCircleIcon,
  Add01Icon,
  SidebarLeftIcon,
  SidebarLeft01Icon,
  Logout01Icon
} from "hugeicons-react";
import UserRail from "./UserRail";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: Home01Icon },
  { to: "/dashboard/saved", label: "Saved", icon: Bookmark01Icon },
  { to: "/dashboard/uploads", label: "Uploads", icon: UploadSquare01Icon },
  { to: "/dashboard/notifications", label: "Notifications", icon: Notification01Icon },
  { to: "/dashboard/settings", label: "Settings", icon: Settings01Icon },
  { to: "/dashboard/help", label: "Help", icon: HelpCircleIcon },
];

const railWidth = 80;
const panelWidth = 260;

const Sidebar: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false);

  const handleLogout = () => {
    // TODO: hook into auth
    console.log("logout");
  };

  const togglePanel = () => {
    setShowPanel(!showPanel);
  };

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
                aria-label="Toggle sidebar panel">
                {showPanel ? (
                  <SidebarLeft01Icon size={22} className="text-gray-700 transition-opacity duration-200" />
                ) : (
                  <SidebarLeftIcon size={22} className="text-gray-700 transition-opacity duration-200" />
                )}
              </button>

              {/* New button */}
              <button className="mt-4 w-12 h-12 grid place-items-center mx-auto rounded-full bg-brand text-white shadow-sm transition-transform duration-200 hover:scale-105" aria-label="New">
                <Add01Icon size={20} />
              </button>

              {/* Nav rail */}
              <nav className="mt-6 flex flex-col items-center gap-6">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={({ isActive }) => "flex flex-col items-center gap-1"}>
                    {({ isActive }) => (
                      <>
                        <div
                          className={`grid place-items-center h-10 w-10 rounded-2xl transition-all duration-200 hover:scale-105 ${
                            isActive ? "bg-brand text-white shadow-md" : "text-gray-700 hover:bg-[#DCDFFE]"
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <span className={`text-[11px] transition-colors ${isActive ? "text-brand font-medium" : "text-gray-700"}`}>{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* User avatar fixed on rail bottom */}
            <UserRail onLogout={handleLogout} />
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
              <div className="flex items-center gap-2 mb-4">
                <img src="/assets/logo.svg" className="h-6" alt="UniNav" />
                <span className="font-semibold text-brand">UniNav</span>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-2">Announcement</h4>
                <div className="h-24 rounded-xl border bg-white/70" />
              </div>

              <div className="flex-1">
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

              {/* User summary at bottom (no avatar) */}
              <div className="mt-6 border-t pt-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">Tee Daniels</p>
                  <p className="text-xs text-muted-foreground truncate">tee@uninav.edu</p>
                </div>
                <button onClick={handleLogout} className="text-xs text-white bg-red-600 hover:bg-red-700 rounded-md px-3 py-1 flex items-center gap-1">
                  <Logout01Icon size={14} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
