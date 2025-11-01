import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft01Icon,
  Search01Icon,
  ArrowRight02Icon,
  Rocket01Icon,
  UploadSquare01Icon,
  InformationCircleIcon,
  Mail01Icon,
  MinusSignIcon,
  PlusSignIcon,
} from "hugeicons-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper icon components

const WhatsAppIconSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

interface FAQItem {
  question: string;
  answer: string;
}

const Help: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQs, setExpandedFAQs] = useState<Set<number>>(new Set());
  
  // Quick Help scroll state
  const quickHelpScrollRef = useRef<HTMLDivElement>(null);
  const [quickHelpIndex, setQuickHelpIndex] = useState(0);
  
  // Contact Support scroll state
  const contactSupportScrollRef = useRef<HTMLDivElement>(null);
  const [contactSupportIndex, setContactSupportIndex] = useState(0);
  
  // Contact Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs: FAQItem[] = [
    {
      question: "Is UniNav really free?",
      answer:
        "Yes! UniNav is completely free for all students. We believe in making educational resources accessible to everyone without any cost barriers.",
    },
    {
      question: "What kinds of files can I upload?",
      answer:
        "You can upload various file types including PDFs, DOCX documents, images (JPG, PNG), and links to helpful resources. All uploads are reviewed by our moderators to ensure quality and relevance.",
    },
    {
      question: "How do I find materials for my specific courses?",
      answer:
        "You can search for materials by course code (e.g., 'CSC 204'), course title, or keywords. You can also browse materials by filtering through your saved courses in the Libraries section.",
    },
    {
      question: "The WhatsApp bot isn't responding—what do I do?",
      answer:
        "If the WhatsApp bot isn't responding, please check your internet connection first. If the issue persists, contact our support team via email at support@uninav.com and we'll help you get it working.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSearch = (query: string) => {
    // Search functionality - can be expanded later
    console.log("Searching help articles:", query);
  };

  // Quick Help scroll handlers
  const scrollQuickHelpToIndex = (index: number) => {
    const container = quickHelpScrollRef.current;
    if (!container) return;

    const isTablet = window.innerWidth >= 768; // md breakpoint
    const cardWidth = isTablet ? container.clientWidth / 3 : container.clientWidth;
    const scrollPosition = index * cardWidth;
    
    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  };

  const handleQuickHelpScroll = () => {
    const container = quickHelpScrollRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const isTablet = window.innerWidth >= 768; // md breakpoint
    const cardWidth = isTablet ? container.clientWidth / 3 : container.clientWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    
    if (newIndex !== quickHelpIndex) {
      setQuickHelpIndex(newIndex);
    }
  };

  // Contact Support scroll handlers
  const scrollContactSupportToIndex = (index: number) => {
    const container = contactSupportScrollRef.current;
    if (!container) return;

    const isTablet = window.innerWidth >= 768; // md breakpoint
    const cardWidth = isTablet ? container.clientWidth / 2 : container.clientWidth;
    const scrollPosition = index * cardWidth;
    
    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  };

  const handleContactSupportScroll = () => {
    const container = contactSupportScrollRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const isTablet = window.innerWidth >= 768; // md breakpoint
    const cardWidth = isTablet ? container.clientWidth / 2 : container.clientWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    
    if (newIndex !== contactSupportIndex) {
      setContactSupportIndex(newIndex);
    }
  };

  // Contact form handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      console.log("Form submitted:", formData);
      setIsSubmitting(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
      // You can add toast notification here
    }, 1000);
  };

  return (
    <>
      {/* Header */}
      <div className="relative z-sticky">
        <div className="bg-gradient-to-br from-[theme(colors.dashboard.gradientFrom)] to-[theme(colors.dashboard.gradientTo)]">
          <div className="px-2 sm:px-4 pt-16 sm:pt-20 pb-4 sm:pb-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground">
                  UniNav Help Center
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Find answers, learn how to contribute, and get support.
                </p>

                {/* Search Bar */}
                <div className="mt-6 flex justify-center relative z-10">
                  <div className="w-full max-w-xl flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 bg-white rounded-full border border-gray-200 px-3 py-2.5">
                      <Search01Icon size={18} className="text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          handleSearch(e.target.value);
                        }}
                        placeholder="Search Help Articles"
                        className="w-full bg-transparent outline-none text-base"
                      />
                    </div>
                    <button
                      onClick={() => handleSearch(searchQuery)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white shrink-0 bg-brand hover:bg-brand/90 transition-colors duration-200"
                      aria-label="Search"
                    >
                      <ArrowRight02Icon size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-10 bg-gradient-to-b from-transparent to-white" />
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-8 pb-28">
        {/* Quick Help Section */}
        <section className="mb-12">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
            Quick Help
          </h3>
          
          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-3 gap-4 sm:gap-6">
            {/* Getting Started Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-200 flex items-center justify-center bg-brand/10 flex-shrink-0">
                  <Rocket01Icon size={20} className="sm:w-6 sm:h-6 text-brand" />
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 pt-1">
                  Getting Started
                </h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>How to search for materials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>How to upload notes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>How points work</span>
                </li>
              </ul>
            </div>

            {/* Uploading Materials Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-200 flex items-center justify-center bg-brand/10 flex-shrink-0">
                  <UploadSquare01Icon size={20} className="sm:w-6 sm:h-6 text-brand" />
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 pt-1">
                  Uploading Materials
                </h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>What files are allowed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Why uploads get rejected</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>How to edit your uploads</span>
                </li>
              </ul>
            </div>

            {/* Account Help Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-200 flex items-center justify-center bg-brand/10 flex-shrink-0">
                  <InformationCircleIcon size={20} className="sm:w-6 sm:h-6 text-brand" />
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 pt-1">
                  Account Help
                </h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <a
                    href="http://localhost:3000/auth/password/forgot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand hover:underline cursor-pointer"
                  >
                    Reset password
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span className="text-gray-400 cursor-not-allowed">
                    Change email <span className="text-xs text-gray-500">(Not available)</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <button
                    onClick={() => navigate("/dashboard/settings?tab=academic")}
                    className="text-brand hover:underline cursor-pointer text-left"
                  >
                    Update academic profile
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile/Tablet Horizontal Scroll */}
          <div className="md:hidden">
            <div
              ref={quickHelpScrollRef}
              onScroll={handleQuickHelpScroll}
              className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {/* Getting Started Card */}
              <div className="flex-shrink-0 w-full snap-center" style={{ scrollSnapAlign: 'center' }}>
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-200 flex items-center justify-center bg-brand/10 flex-shrink-0">
                      <Rocket01Icon size={20} className="sm:w-6 sm:h-6 text-brand" />
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 pt-1">
                      Getting Started
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>How to search for materials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>How to upload notes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>How points work</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Uploading Materials Card */}
              <div className="flex-shrink-0 w-full snap-center" style={{ scrollSnapAlign: 'center' }}>
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-200 flex items-center justify-center bg-brand/10 flex-shrink-0">
                      <UploadSquare01Icon size={20} className="sm:w-6 sm:h-6 text-brand" />
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 pt-1">
                      Uploading Materials
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>What files are allowed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>Why uploads get rejected</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>How to edit your uploads</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Account Help Card */}
              <div className="flex-shrink-0 w-full snap-center" style={{ scrollSnapAlign: 'center' }}>
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-200 flex items-center justify-center bg-brand/10 flex-shrink-0">
                      <InformationCircleIcon size={20} className="sm:w-6 sm:h-6 text-brand" />
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 pt-1">
                      Account Help
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <a
                        href="http://localhost:3000/auth/password/forgot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand hover:underline cursor-pointer"
                      >
                        Reset password
                      </a>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span className="text-gray-400 cursor-not-allowed">
                        Change email <span className="text-xs text-gray-500">(Not available)</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <button
                        onClick={() => navigate("/dashboard/settings?tab=academic")}
                        className="text-brand hover:underline cursor-pointer text-left"
                      >
                        Update academic profile
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Swiper Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: 3 }, (_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuickHelpIndex(index);
                    scrollQuickHelpToIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === quickHelpIndex
                      ? 'bg-brand w-6'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to card ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Contact Support Section */}
        <section className="mb-12">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
            Contact Support
          </h3>
          
          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-2 gap-4 sm:gap-6">
            {/* WhatsApp Support Card */}
            <a
              href="https://wa.me/2349155004456"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow block cursor-pointer"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-200 flex items-center justify-center bg-green-50 text-green-600 flex-shrink-0">
                  <WhatsAppIconSVG />
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 pt-1">
                  WhatsApp Support
                </h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Fastest response</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Send photos/screenshots</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Available 9AM-9PM</span>
                </li>
              </ul>
            </a>

            {/* Email Support Card */}
            <a
              href="mailto:uninav.buildminds@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow block cursor-pointer"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-200 flex items-center justify-center bg-blue-50 flex-shrink-0">
                  <Mail01Icon size={20} className="sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 pt-1">
                  Email Support
                </h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>For complex issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>24-hour response time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>uninav.buildminds@gmail.com</span>
                </li>
              </ul>
            </a>
          </div>

          {/* Mobile/Tablet Horizontal Scroll */}
          <div className="md:hidden">
            <div
              ref={contactSupportScrollRef}
              onScroll={handleContactSupportScroll}
              className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {/* WhatsApp Support Card */}
              <div className="flex-shrink-0 w-full snap-center" style={{ scrollSnapAlign: 'center' }}>
                <a
                  href="https://wa.me/2349155004456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow block cursor-pointer"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-200 flex items-center justify-center bg-green-50 text-green-600 flex-shrink-0">
                      <WhatsAppIconSVG />
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 pt-1">
                      WhatsApp Support
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>Fastest response</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>Send photos/screenshots</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>Available 9AM-9PM</span>
                    </li>
                  </ul>
                </a>
              </div>

              {/* Email Support Card */}
              <div className="flex-shrink-0 w-full snap-center" style={{ scrollSnapAlign: 'center' }}>
                <a
                  href="mailto:uninav.buildminds@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow block cursor-pointer"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-200 flex items-center justify-center bg-blue-50 flex-shrink-0">
                      <Mail01Icon size={20} className="sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 pt-1">
                      Email Support
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>For complex issues</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>24-hour response time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>uninav.buildminds@gmail.com</span>
                    </li>
                  </ul>
                </a>
              </div>
            </div>

            {/* Swiper Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: 2 }, (_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setContactSupportIndex(index);
                    scrollContactSupportToIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === contactSupportIndex
                      ? 'bg-brand w-6'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to card ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & FAQs Section */}
        <div className="md:grid md:grid-cols-2 md:gap-6 flex flex-col md:flex-row">
          {/* Contact Form - Mobile/Tablet: comes before FAQ, Desktop: beside FAQ */}
          <section className="mb-12 md:mb-12 order-1">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
              Send us a Message
            </h3>
            
            {/* Desktop Form */}
            <form onSubmit={handleSubmit} className="hidden md:block">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="What's this about?"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                      placeholder="Tell us more..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </div>
            </form>

            {/* Mobile/Tablet Form */}
            <form onSubmit={handleSubmit} className="md:hidden">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name-mobile"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email-mobile"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject-mobile"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      placeholder="What's this about?"
                    />
                  </div>
                  <div>
                    <label htmlFor="message-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message-mobile"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                      placeholder="Tell us more..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </div>
            </form>
          </section>

          {/* FAQs Section - Desktop: beside form, Mobile: after form */}
          <section className="mb-12 md:mb-12 order-2">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
              FAQs
            </h3>
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-medium text-gray-900 pr-4">
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedFAQs.has(index) ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      {expandedFAQs.has(index) ? (
                        <MinusSignIcon
                          size={20}
                          className="text-gray-600 flex-shrink-0"
                        />
                      ) : (
                        <PlusSignIcon
                          size={20}
                          className="text-gray-600 flex-shrink-0"
                        />
                      )}
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {expandedFAQs.has(index) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Help;

