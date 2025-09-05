import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logout01Icon } from "hugeicons-react";
import { LogoutModal } from "@/components/modals";

type Props = {
  avatarUrl?: string;
  userName?: string;
  onLogout?: () => void;
};

const UserRail: React.FC<Props> = ({ 
  avatarUrl = "https://i.pravatar.cc/80?img=12", 
  userName = "User",
  onLogout 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    onLogout?.();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <div className="grid place-items-center pb-2">
        <div 
          className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/50 focus:outline-none focus:ring-brand/50 transition-shadow cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleLogoutClick}
        >
          {/* User Avatar */}
          <AnimatePresence mode="wait">
            {!isHovered ? (
              <motion.img 
                key="avatar"
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                src={avatarUrl} 
                className="h-full w-full object-cover" 
                alt="User" 
              />
            ) : (
              <motion.div
                key="logout"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="h-full w-full bg-red-500 flex items-center justify-center"
              >
                <Logout01Icon size={20} className="text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        userName={userName}
      />
    </>
  );
};

export default UserRail;
