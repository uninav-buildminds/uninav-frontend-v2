import React from "react";
import { Menu01Icon, Cancel01Icon } from "hugeicons-react";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-modal p-3 bg-white rounded-2xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors md:hidden"
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
