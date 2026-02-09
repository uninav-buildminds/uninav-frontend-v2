import React from "react";
import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  value: string | number;
  description: string;
};

const MetricCard: React.FC<Props> = ({ icon, title, value, description }) => {
  return (
    <div className="relative rounded-2xl border bg-white p-3 sm:p-4 transition-shadow duration-200 hover:shadow-md">
      <div className="absolute top-2.5 right-2.5 h-9 w-9 rounded-xl border border-brand text-brand flex items-center justify-center">
        {icon}
      </div>
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-2xl font-semibold text-brand">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </div>
  );
};

export default MetricCard;
