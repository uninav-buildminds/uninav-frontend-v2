import { cn } from "@/lib/utils";

interface ChallengeFeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function ChallengeFeatures({ challenges }: { challenges: ChallengeFeatureProps[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 relative z-10 py-16 md:py-20 max-w-6xl mx-auto">
      {challenges.map((challenge, index) => (
        <ChallengeFeature key={challenge.title} {...challenge} index={index} />
      ))}
    </div>
  );
}

const ChallengeFeature = ({
  title,
  description,
  icon,
  index,
}: ChallengeFeatureProps & { index: number }) => {
  return (
    <div
      className={cn(
        "flex flex-col py-10 relative group/feature",
        index > 0 && "md:border-l border-gray-200"
      )}
    >
      {/* Hover effect overlay */}
      <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-brand/5 to-transparent pointer-events-none" />
      
      {/* Icon */}
      <div className="mb-4 relative z-10 text-foreground flex justify-start pl-6">
        {icon}
      </div>
      
      {/* Title with animated line */}
      <div className="text-lg font-semibold mb-3 relative z-10 flex justify-start pl-6">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-brand/30 group-hover/feature:bg-brand transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-foreground">
          {title}
        </span>
      </div>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs relative z-10 text-left pl-6">
        {description}
      </p>
    </div>
  );
};
