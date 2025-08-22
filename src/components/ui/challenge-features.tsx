import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

interface ChallengeFeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export function ChallengeFeatures({ challenges }: { challenges: ChallengeFeatureProps[] }) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 relative z-10 py-8 sm:py-12 md:py-20 max-w-6xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
    >
      {challenges.map((challenge, index) => (
        <ChallengeFeature key={challenge.title} {...challenge} index={index} />
      ))}
    </motion.div>
  );
}

const ChallengeFeature = ({
  title,
  description,
  icon,
  index,
}: ChallengeFeatureProps & { index: number }) => {
  return (
    <motion.div
      className={cn(
        "flex flex-col py-6 sm:py-8 md:py-10 relative group/feature",
        index > 0 && "md:border-l border-gray-200"
      )}
      variants={itemVariants}
    >
      {/* Hover effect overlay */}
      <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-brand/5 to-transparent pointer-events-none" />
      
      {/* Icon */}
      <div className="mb-3 sm:mb-4 relative z-10 text-foreground flex justify-start pl-4 sm:pl-6">
        {icon}
      </div>
      
      {/* Title with animated line */}
      <div className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 relative z-10 flex justify-start pl-4 sm:pl-6">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-brand/30 group-hover/feature:bg-brand transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-foreground">
          {title}
        </span>
      </div>
      
      {/* Description */}
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs relative z-10 text-left pl-4 sm:pl-6">
        {description}
      </p>
    </motion.div>
  );
};
