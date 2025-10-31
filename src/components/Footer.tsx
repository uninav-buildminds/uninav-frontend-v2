import React from "react";
import { Phone, Mail, MessageCircle } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto max-w-6xl px-4 md:px-6 py-8 sm:py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mb-6 sm:mb-8">
          {/* Branding and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <img src="/assets/logo.svg" alt="UniNav logo" className="h-8 sm:h-10 w-auto" />
            </div>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-xs">
              Empowering students with the knowledge and community they need to excel academically.
            </p>
            {/* Contact Icons */}
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://wa.me/2349155004456"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-green-600 hover:text-green-700 transition-colors text-lg"
                title="WhatsApp: +234 915 500 4456"
              >
                <MessageCircle size={20} />
              </a>
              <a
                href="mailto:uninav.buildminds@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Email"
                className="text-blue-600 hover:text-blue-800 transition-colors text-lg"
                title="uninav.buildminds@gmail.com"
              >
                <Mail size={20} />
              </a>
              <a
                href="tel:+2349155004456"
                aria-label="Phone"
                className="text-gray-700 hover:text-gray-900 transition-colors text-lg"
                title="Call: 09161285630 / +234 915 500 4456"
              >
                <Phone size={20} />
              </a>
            </div>
          </div>

          {/* Navigate Column */}
          <div>
            <h3 className="font-bold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">NAVIGATE</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200 text-sm">Home</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200 text-sm">Department</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200 text-sm">Faculty</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200 text-sm">About</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200 text-sm">Mission & Vision</a></li>
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h3 className="font-bold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">HELP</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200 text-sm">WhatsApp Support</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200 text-sm">Content Guidelines</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200 text-sm">Report Issue</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200 text-sm">How It Works</a></li>
            </ul>
          </div>

          {/* Policies Column */}
          <div>
            <h3 className="font-bold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">POLICIES</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200 text-sm">Honor Code</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200 text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200 text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200 text-sm">Academic Integrity</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Row - Copyright and Attribution */}
        <div className="border-t border-gray-200 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-gray-500 text-xs sm:text-sm">
              © 2025 UniNav. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              Built with ❤️ for students by students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
