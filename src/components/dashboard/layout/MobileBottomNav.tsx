import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, FolderLibraryIcon, Home01Icon, Notification01Icon, Settings01Icon } from "@hugeicons/core-free-icons";
import { UploadModal } from "@/components/modals";
import { useAuth } from "@/hooks/useAuth";
import { isProfileIncomplete } from "@/utils/profile.utils";

const MobileBottomNav: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { user } = useAuth();
  const profileIncomplete = isProfileIncomplete(user);
  
  const navItems = [
    { to: "/dashboard", label: "Home", icon: Home01Icon },
    { to: "/dashboard/libraries", label: "Folder", icon: FolderLibraryIcon },
    { to: "/dashboard/notifications", label: "Notifications", icon: Notification01Icon },
    { to: "/dashboard/settings", label: "Settings", icon: Settings01Icon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden z-fixed">
      <div className="flex items-center justify-around">
        {/* Home */}
        <NavLink 
          to="/dashboard" 
          end
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
              isActive ? 'text-brand' : 'text-gray-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <HugeiconsIcon icon={Home01Icon} strokeWidth={1.5} size={20} className={isActive ? 'fill-current' : ''} />
              <span className="text-xs font-medium">Home</span>
            </>
          )}
        </NavLink>

        {/* Libraries (Folder) */}
        <NavLink 
          to="/dashboard/libraries" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
              isActive ? 'text-brand' : 'text-gray-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <HugeiconsIcon icon={FolderLibraryIcon} strokeWidth={1.5} size={20} className={isActive ? 'fill-current' : ''} />
              <span className="text-xs font-medium">Libraries</span>
            </>
          )}
        </NavLink>

        {/* Plus Button - Centered and Prominent */}
        <button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center justify-center w-12 h-12 bg-brand text-white rounded-full shadow-lg hover:bg-brand/90 transition-colors"
        >
          <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} size={24} />
        </button>

        {/* Notifications */}
        <NavLink 
          to="/dashboard/notifications" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
              isActive ? 'text-brand' : 'text-gray-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <HugeiconsIcon icon={Notification01Icon} strokeWidth={1.5} size={20} className={isActive ? 'fill-current' : ''} />
              <span className="text-xs font-medium">Notifications</span>
            </>
          )}
        </NavLink>

        {/* Settings */}
        <NavLink 
          to="/dashboard/settings" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors relative ${
              isActive ? 'text-brand' : 'text-gray-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} size={20} className={isActive ? 'fill-current' : ''} />
                {/* Profile Incomplete Badge */}
                {profileIncomplete && (
                  <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-white shadow-md" />
                )}
              </div>
              <span className="text-xs font-medium">Settings</span>
            </>
          )}
        </NavLink>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </nav>
  );
};

export default MobileBottomNav;
