import React, { useContext, useState } from "react";
import { LayoutDashboard, LogOut, Menu, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "./ui/menubar";
import AuthContext from "@/context/authentication/AuthContext";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

const ChevronDownIcon = () => (
  <svg
    className="ml-1 h-4 w-4 text-current"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading, logOut } = useContext(AuthContext);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="fixed top-6 inset-x-0 z-fixed flex justify-center px-4">
      <motion.div
        className="w-[min(1100px,100%)] flex items-center justify-between gap-4 rounded-full border bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm px-4 md:px-6 py-3"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <a href="/" className="inline-flex items-center gap-2">
          <img
            src="/assets/logo.svg"
            alt="UniNav logo"
            className="h-8 w-auto"
          />
          <span className="text-base font-semibold text-brand">UniNav</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#home" className="hover:text-brand transition-colors">
            Home
          </a>
          <a href="#challenge" className="hover:text-brand transition-colors">
            Challenge
          </a>
          <a href="#solution" className="hover:text-brand transition-colors">
            Solution
          </a>
          <a href="/clubs" className="hover:text-brand transition-colors">
            Clubs
          </a>
          <a href="#features" className="hover:text-brand transition-colors">
            Features
          </a>
          <a href="#faqs" className="hover:text-brand transition-colors">
            FAQs
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user && (
            <>
              <a
                href="/dashboard"
                className="flex items-center gap-2 px-2 py-1 rounded-full border border-gray-200 hover:border-brand/50 hover:bg-brand/5 transition-all cursor-pointer group"
              >
                <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-brand/20 group-hover:ring-brand/50 transition-all">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-brand text-white flex items-center justify-center text-[10px] font-semibold">
                      {getInitials(user.firstName, user.lastName)}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-brand transition-colors leading-tight">
                  Dashboard
                </span>
              </a>
            </>
          )}
          {!user && isLoading && (
            <div className="inline-flex items-center justify-center rounded-full border border-brand px-4 py-2 text-sm font-medium text-brand">
              <span>Validating</span>
              <div className="ms-2 animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>
            </div>
          )}
          {!user && !isLoading && (
            <a
              href="/auth/signin"
              className="inline-flex items-center justify-center rounded-full border border-brand px-4 py-2 text-sm font-medium text-brand"
            >
              <span>Sign In</span>
            </a>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-gray-600" />
          ) : (
            <Menu className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="md:hidden absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl border shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/95"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <nav className="p-4 space-y-3">
              <a
                href="#home"
                className="block px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="#challenge"
                className="block px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Challenge
              </a>
              <a
                href="#solution"
                className="block px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Solution
              </a>
              <a
                href="#features"
                className="block px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#faqs"
                className="block px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQs
              </a>
              <a
                href="/clubs"
                className="block px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Clubs
              </a>
            </nav>

            <div className="border-t p-10 space-y-3">
              {user && (
                <>
                  <a
                    href="/dashboard"
                    className="flex items-center justify-between w-full rounded-xl px-4 py-3 text-sm font-medium text-white bg-brand hover:bg-brand/90 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Dashboard</span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      strokeWidth={1.5}
                      size={18}
                    />
                  </a>
                </>
              )}
              {!user && isLoading && (
                <div className="flex justify-center items-center gap-4 w-full text-center rounded-xl border border-brand px-4 py-3 text-sm font-medium text-brand">
                  <span>Validating</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>
                </div>
              )}
              {!user && !isLoading && (
                <a
                  href="/auth/signin"
                  className="block w-full text-center rounded-xl border border-brand px-4 py-3 text-sm font-medium text-brand"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Header;
