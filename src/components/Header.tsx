import React from "react";

const NAV_BRAND_COLOR = "#0410A2";

const Header: React.FC = () => {
  return (
    <div className="fixed top-6 inset-x-0 z-[5000] flex justify-center px-4">
      <div className="w-[min(1100px,100%)] flex items-center justify-between gap-4 rounded-full border bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm px-4 md:px-6 py-3">
        <a href="/" className="inline-flex items-center gap-2">
          <img src="/assets/logo.svg" alt="UniNav logo" className="h-8 w-auto" />
          <span className="text-base font-semibold" style={{ color: NAV_BRAND_COLOR }}>UniNav</span>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#home" className="hover:text-neutral-700">Home</a>
          <a href="#browse" className="hover:text-neutral-700">Browse Courses</a>
          <a href="#faqs" className="hover:text-neutral-700">FAQs</a>
          <a href="#contact" className="hover:text-neutral-700">Contact</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#upload"
            className="hidden sm:inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: NAV_BRAND_COLOR }}
          >
            Upload
          </a>
          <a
            href="#signin"
            className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default Header;


