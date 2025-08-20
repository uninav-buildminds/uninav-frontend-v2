import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto max-w-6xl px-4 md:px-6 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8">
          {/* Branding and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/assets/logo.svg" alt="UniNav logo" className="h-10 w-auto" />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
              Empowering students with the knowledge and community they need to excel academically.
            </p>
          </div>

          {/* Navigate Column */}
          <div>
            <h3 className="font-bold text-foreground mb-4">NAVIGATE</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200">Home</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200">Department</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200">Faculty</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200">About</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200">Mission & Vision</a></li>
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h3 className="font-bold text-foreground mb-4">HELP</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200">WhatsApp Support</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200">Content Guidelines</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200">Report Issue</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200">How It Works</a></li>
            </ul>
          </div>

          {/* Policies Column */}
          <div>
            <h3 className="font-bold text-foreground mb-4">POLICIES</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200">Honor Code</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 hover:text-foreground transition-colors duration-200">Academic Integrity</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Row - Copyright and Attribution */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 UniNav. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm">
              Built with ❤️ for students by students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
