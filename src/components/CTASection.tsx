import React from "react";

const CTASection: React.FC = () => {
  return (
    <section className="bg-[#010323]">
      <div className="container mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Side - Text and Button */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6 text-white">
              Everything You Need to Study Smarter
            </h2>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl lg:max-w-none">
              Join thousands of students who've discovered the smarter way to study
            </p>
            
            <button className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-medium text-white bg-brand hover:bg-brand/90 transition-colors duration-200 shadow-lg hover:shadow-xl">
              Get Started for free
            </button>
          </div>
          
          {/* Right Side - Mobile App Mockups */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative">
              <img 
                src="/assets/cta-img.svg" 
                alt="UniNav mobile app mockups"
                className="w-full max-w-md lg:max-w-lg h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
