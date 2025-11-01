import React from "react";
import { Phone, Mail } from "lucide-react";

const WhatsAppIconSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

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
                <WhatsAppIconSVG />
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
