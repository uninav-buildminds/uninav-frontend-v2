import React from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Link } from "react-router-dom";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 } },
};

const CTASection: React.FC = () => {
  return (
    <section className="bg-[#010323]">
      <motion.div
        className="container mx-auto max-w-6xl px-4 md:px-6 py-12 sm:py-16 md:py-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -20% 0px" }}
      >
        <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
          {/* Left Side - Text and Button */}
          <div className="flex-1 text-center lg:text-left">
            <motion.h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 sm:mb-6 text-white" variants={itemVariants}>
              Everything You Need to Study Smarter
            </motion.h2>
            
            <motion.p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl lg:max-w-none px-2 sm:px-0" variants={itemVariants}>
              Join thousands of students who've discovered the smarter way to study
            </motion.p>
            
            <motion.div variants={itemVariants}>
              <Link 
                to="/auth/signup"
                className="inline-flex items-center justify-center rounded-xl px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium text-white bg-brand hover:bg-brand/90 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started for free
              </Link>
            </motion.div>
          </div>
          
          {/* Right Side - Mobile App Mockups */}
          <motion.div className="flex-1 flex justify-center lg:justify-end" variants={imageVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "0px 0px -15% 0px" }}>
            <div className="relative">
              <img 
                src="/assets/cta-img.svg" 
                alt="UniNav mobile app mockups"
                className="w-full max-w-sm sm:max-w-md lg:max-w-lg h-auto"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
