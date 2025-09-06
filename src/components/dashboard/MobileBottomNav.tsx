import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home01Icon,
  Bookmark01Icon,
  UploadSquare01Icon,
  Settings01Icon,
  Add01Icon
} from "hugeicons-react";
import { UploadModal } from "@/components/modals";

const MobileBottomNav: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const navItems = [
    { to: "/dashboard", label: "Home", icon: Home01Icon },
    { to: "/dashboard/saved", label: "Saved", icon: Bookmark01Icon },
    { to: "/dashboard/uploads", label: "Uploads", icon: UploadSquare01Icon },
    { to: "/dashboard/settings", label: "Settings", icon: Settings01Icon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden z-fixed">
      <div className="flex items-center justify-around">
        {/* Home */}
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
              isActive ? 'text-brand' : 'text-gray-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Home01Icon size={20} className={isActive ? 'fill-current' : ''} />
              <span className="text-xs font-medium">Home</span>
            </>
          )}
        </NavLink>

        {/* Saved */}
        <NavLink 
          to="/dashboard/saved" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
              isActive ? 'text-brand' : 'text-gray-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Bookmark01Icon size={20} className={isActive ? 'fill-current' : ''} />
              <span className="text-xs font-medium">Saved</span>
            </>
          )}
        </NavLink>

        {/* Plus Button - Centered and Prominent */}
        <button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center justify-center w-12 h-12 bg-brand text-white rounded-full shadow-lg hover:bg-brand/90 transition-colors"
        >
          <Add01Icon size={24} />
        </button>

        {/* Uploads */}
        <NavLink 
          to="/dashboard/uploads" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
              isActive ? 'text-brand' : 'text-gray-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <UploadSquare01Icon size={20} className={isActive ? 'fill-current' : ''} />
              <span className="text-xs font-medium">Uploads</span>
            </>
          )}
        </NavLink>

        {/* Settings */}
        <NavLink 
          to="/dashboard/settings" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
              isActive ? 'text-brand' : 'text-gray-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Settings01Icon size={20} className={isActive ? 'fill-current' : ''} />
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
