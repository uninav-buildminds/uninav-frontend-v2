import React from "react";

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
  return (
    <div className="fixed top-6 inset-x-0 z-[5000] flex justify-center px-4">
      <div className="w-[min(1100px,100%)] flex items-center justify-between gap-4 rounded-full border bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm px-4 md:px-6 py-3">
        <a href="/" className="inline-flex items-center gap-2">
          <img src="/assets/logo.svg" alt="UniNav logo" className="h-8 w-auto" />
          <span className="text-base font-semibold text-brand">UniNav</span>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#home" className="hover:text-brand transition-colors">Home</a>
          <a href="#browse" className="flex items-center hover:text-brand transition-colors">
            Browse Courses
            <ChevronDownIcon />
          </a>
          <a href="#faqs" className="hover:text-brand transition-colors">FAQs</a>
          <a href="#contact" className="hover:text-brand transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#upload"
            className="hidden sm:inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-white bg-brand"
          >
            Upload
          </a>
          <a
            href="#signin"
            className="inline-flex items-center justify-center rounded-full border border-brand px-4 py-2 text-sm font-medium text-brand"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default Header;
