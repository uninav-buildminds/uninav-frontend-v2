import React from "react";

interface BadgeProps {
  text: string;
  className?: string;
}

const FeaturesBadge: React.FC<BadgeProps> = ({ text, className = "" }) => {
  return (
    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border-2 border-brand bg-gradient-to-br from-gradient-from to-gradient-to ${className}`}>
      <img 
        src="/assets/badges/features-badge.svg" 
        alt="Features icon" 
        className="w-8 h-8"
      />
      <span className="text-sm font-medium text-section-DEFAULT">{text}</span>
    </div>
  );
};

export default FeaturesBadge;
