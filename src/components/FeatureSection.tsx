import React from "react";
import { FeaturesBadge } from "./badges";
import { cn } from "@/lib/utils";
import {
  Search,
  MessageCircle,
  Trophy,
  Zap,
  Shield,
  Users
} from "lucide-react";
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

const FeatureSection: React.FC = () => {
  const features = [
    {
      title: "Smart Search",
      description: "Type anything - 'PHY 205 slides', 'last year's quiz' - we'll find it. Find any material in seconds, not hours of digging through folders",
      icon: <Search size={24} />,
      isComingSoon: false
    },
    {
      title: "Instant Verification",
      description: "All materials are checked by senior students and teaching assistants. Study with confidence knowing content is accurate and up-to-date",
      icon: <Zap size={24} />,
      isComingSoon: false
    },
    {
      title: "Honor Code Compliant",
      description: "Built with academic integrity in mind. Past papers only, no current assignments. Share and access materials without worrying about academic violations",
      icon: <Shield size={24} />,
      isComingSoon: false
    },
    {
      title: "WhatsApp Bot",
      description: "Get notes via chat when you're offline. Just message 'Send BIO 103 notes'. Access your study materials anywhere, even without internet",
      icon: <MessageCircle size={24} />,
      isComingSoon: true
    },
    {
      title: "Rewards That Matter",
      description: "10 uploads = Skip the queue for popular materials. 50 = Free printing credit. Turn your knowledge sharing into real campus perks",
      icon: <Trophy size={24} />,
      isComingSoon: true
    },
    {
      title: "Community Driven",
      description: "Connect with study groups, find study partners, and build your academic network. Build lasting relationships while succeeding academically",
      icon: <Users size={24} />,
      isComingSoon: true
    }
  ];

  return (
    <section className="bg-white" id="features">
      <motion.div
        className="container mx-auto max-w-6xl px-4 md:px-6 text-center py-12 sm:py-16 md:py-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -20% 0px" }}
      >
        <motion.div variants={itemVariants}>
          <FeaturesBadge text="Features" className="mb-6 sm:mb-8" />
        </motion.div>
        
        <motion.h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 sm:mb-6 text-foreground" variants={itemVariants}>
          Everything You Need to Study Smarter
        </motion.h2>
        
        <motion.p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 sm:mb-16 px-2 sm:px-0" variants={itemVariants}>
          Powerful features designed by students, for students. Because we know what actually helps.
        </motion.p>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10 py-6 sm:py-8 md:py-10 max-w-7xl mx-auto" variants={containerVariants}>
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

const Feature = ({
  title,
  description,
  icon,
  index,
  isComingSoon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
  isComingSoon: boolean;
}) => {
  return (
    <motion.div
      className={cn(
        "flex flex-col lg:border-r py-6 sm:py-8 md:py-10 relative group/feature",
        (index === 0 || index === 3) && "lg:border-l",
        index < 3 && "lg:border-b"
      )}
      variants={itemVariants}
    >
      {index < 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-brand/5 to-transparent pointer-events-none" />
      )}
      {index >= 3 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-brand/5 to-transparent pointer-events-none" />
      )}
      
      <div className="mb-3 sm:mb-4 relative z-10 px-6 sm:px-8 md:px-10 text-foreground flex justify-start">
        {icon}
      </div>
      
      <div className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 relative z-10 px-6 sm:px-8 md:px-10 flex justify-start">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-brand/30 group-hover/feature:bg-brand transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-foreground">
          {title}
        </span>
      </div>
      
      {isComingSoon && (
        <div className="absolute top-4 right-4 z-20">
          <span className="text-xs bg-brand/10 text-brand px-2 py-1 rounded-full font-medium">
            COMING SOON
          </span>
        </div>
      )}
      
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs relative z-10 px-6 sm:px-8 md:px-10 text-left">
        {description}
      </p>
    </motion.div>
  );
};

export default FeatureSection;
