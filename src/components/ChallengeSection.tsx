import React from "react";
import { FileText, Users, Timer } from "lucide-react";
import { ChallengeFeatures } from "./ui/challenge-features";
import ChallengeBadge from "./badges/ChallengeBadge";
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

const blockVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const ChallengeSection: React.FC = () => {
  const challenges = [
    {
      title: "Scattered Resources",
      description: "Finding the right study materials can be a daunting task, with resources scattered across various platforms.",
      icon: <FileText size={24} />
    },
    {
      title: "Limited Collaboration",
      description: "Connecting with peers for collaborative study and knowledge sharing is often challenging.",
      icon: <Users size={24} />
    },
    {
      title: "Time Constraints",
      description: "Students face increasing pressure to balance academics with other commitments, leaving less time for effective studying.",
      icon: <Timer size={24} />
    }
  ];

  return (
    <section className="bg-white">
      <motion.div
        className="container mx-auto max-w-6xl px-4 md:px-6 text-center py-8 sm:py-12 md:py-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -20% 0px" }}
      >
        <motion.div variants={itemVariants}>
          <ChallengeBadge text="The Challenge" className="mb-4 sm:mb-6" />
        </motion.div>
        <motion.h2 className="text-2xl sm:text-3xl text-foreground md:text-4xl lg:text-5xl font-semibold mb-4 sm:mb-6" variants={itemVariants}>
          Navigating the Academic Maze
        </motion.h2>
        <motion.p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2 sm:px-0" variants={itemVariants}>
          Students often struggle with fragmented resources, limited collaboration, and time constraints, hindering their academic success.
        </motion.p>
      </motion.div>
      <motion.div
        variants={blockVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      >
        <ChallengeFeatures challenges={challenges} />
      </motion.div>
    </section>
  );
};

export default ChallengeSection;
