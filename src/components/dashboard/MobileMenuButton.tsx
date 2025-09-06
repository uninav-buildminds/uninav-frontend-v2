import React from "react";
import { Menu01Icon, Cancel01Icon } from "hugeicons-react";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ isOpen, onClick, disabled = false, hidden = false }) => {
  if (hidden) return null;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`fixed top-4 left-4 z-mobile-menu p-3 bg-white rounded-2xl shadow-lg border border-gray-200 transition-colors md:hidden ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-gray-50 cursor-pointer'
      }`}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? (
        <Cancel01Icon size={20} className="text-gray-700" />
      ) : (
        <Menu01Icon size={20} className="text-gray-700" />
      )}
    </button>
  );
};

export default MobileMenuButton;
