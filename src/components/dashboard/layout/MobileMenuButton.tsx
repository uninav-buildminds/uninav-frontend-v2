import React, { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, HelpCircleIcon, Menu01Icon, Notification01Icon } from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  disabled?: boolean;
  hidden?: boolean;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ isOpen, onClick, disabled = false, hidden = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      // Check both window scroll and content area scroll
      const windowScroll = window.scrollY;
      const contentArea = document.querySelector('.scroll-surface');
      const contentScroll = contentArea ? contentArea.scrollTop : 0;
      
      const totalScroll = windowScroll + contentScroll;
      const shouldShow = totalScroll > 50;
      setIsScrolled(shouldShow);
    };

    // Listen to both window and content area scroll
    window.addEventListener('scroll', handleScroll);
    const contentArea = document.querySelector('.scroll-surface');
    if (contentArea) {
      contentArea.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (contentArea) {
        contentArea.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  if (hidden) return null;
  
  return (
    <div className={`fixed top-0 left-0 right-0 z-mobile-menu md:hidden transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm' : 'bg-transparent'
    }`}>
      <div className={`flex items-center ${isScrolled ? 'justify-between px-4 py-3' : 'justify-start p-4'}`}>
        <button
          onClick={onClick}
          disabled={disabled}
          className={`p-3 bg-white transition-all duration-300 ${
            isScrolled 
              ? 'rounded-none shadow-none border-none' 
              : 'rounded-2xl shadow-lg border border-gray-200'
          } ${
            disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-50 cursor-pointer'
          }`}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} size={20} className="text-gray-700" />
          ) : (
            <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.5} size={20} className="text-gray-700" />
          )}
        </button>
        
        {isScrolled && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/dashboard/help')}
              className="p-3 hover:bg-gray-50 transition-colors rounded-lg"
              aria-label="Help"
            >
              <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={1.5} size={20} className="text-gray-700" />
            </button>
            <button
              onClick={() => navigate('/dashboard/notifications')}
              className="p-3 hover:bg-gray-50 transition-colors rounded-lg"
              aria-label="Alerts"
            >
              <HugeiconsIcon icon={Notification01Icon} strokeWidth={1.5} size={20} className="text-gray-700" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenuButton;
