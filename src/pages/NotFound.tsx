import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 sm:px-6">
      <motion.div
        className="text-center max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Background 404 Text */}
        <div className="relative mb-8 sm:mb-12">
          <div className="text-9xl sm:text-[12rem] md:text-[16rem] lg:text-[20rem] font-bold text-brand/15 select-none">
            404
          </div>
          
          {/* 404.svg Image positioned over the "0" */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/assets/404.svg"
              alt="Sad character with glasses and tear"
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 object-contain"
            />
          </div>
        </div>

        {/* Heading */}
        <motion.h1 
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6"
          variants={itemVariants}
        >
          Ooops! Page not found
        </motion.h1>

        {/* Description */}
        <motion.p 
          className="text-sm sm:text-base md:text-lg text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0"
          variants={itemVariants}
        >
          Looks like you took a wrong turn on the syllabus! This page must be absent without leave. Don't worry, it happens to the best of us. The link might be broken, or the page has moved. Let's get you back to your studies.
        </motion.p>

        {/* Button */}
        <motion.div variants={itemVariants}>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium text-white bg-brand hover:bg-brand/90 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Go Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
