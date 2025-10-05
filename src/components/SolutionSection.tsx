import React from "react";
import { SolutionBadge } from "./badges";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const SolutionSection: React.FC = () => {
  const solutions = [
    {
      image: "/assets/solution/first.png",
      title: "Centralized Resource Hub",
      description: "UniNav offers a comprehensive solution to these challenges, providing a centralized resource hub, fostering a collaborative learning community, and equipping students with efficient study tools."
    },
    {
      image: "/assets/solution/second.png",
      title: "Collaborative Learning Community",
      description: "Connect with peers, form study groups, and share knowledge within a supportive community."
    },
    {
      image: "/assets/solution/third.png",
      title: "Efficient Study Tools",
      description: "Utilize our efficient study tools and resources to maximize your learning in less time."
    }
  ];

  return (
    <section className="bg-[#010323]" id="solution">
      <motion.div
        className="container mx-auto max-w-6xl px-4 md:px-6 text-center py-12 sm:py-16 md:py-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -20% 0px" }}
      >
        <motion.div className="mb-6 sm:mb-8" variants={itemVariants}>
          <SolutionBadge text="Our Solution" />
        </motion.div>
        
        <motion.h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 sm:mb-6 text-white" variants={itemVariants}>
          Empowering Your Academic Journey
        </motion.h2>
        
        <motion.p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12 sm:mb-16 px-2 sm:px-0" variants={itemVariants}>
          UniNav offers a comprehensive solution to these challenges, providing a centralized resource hub, fostering a collaborative learning community, and equipping students with efficient study tools.
        </motion.p>

        <div className="space-y-12 sm:space-y-16 md:space-y-20">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-6 sm:gap-8 md:gap-12`}
              variants={rowVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            >
              {/* Image */}
              <div className="w-full md:w-1/2">
                <div className="aspect-video overflow-hidden rounded-xl">
                  <img 
                    src={solution.image} 
                    alt={solution.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Content */}
              <div className="w-full md:w-1/2 text-center md:text-left px-2 sm:px-0">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-3 sm:mb-4">
                  {solution.title}
                </h3>
                
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  {solution.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default SolutionSection;
