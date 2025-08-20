import React from "react";

const StatsSection: React.FC = () => {
  const stats = [
    { number: "50+", label: "Students" },
    { number: "100+", label: "Courses" },
    { number: "3+", label: "Departments" },
    { number: "100+", label: "Resources" },
  ];

  return (
    <section className="bg-white">
      {/* Top horizontal line */}
      <div className="border-t border-gray-200 mb-2 md:mb-3" />
      
      <div className="container mx-auto max-w-6xl px-4 md:px-6 py-4 md:py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {stat.number}
              </div>
              <div className="text-sm md:text-base text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom horizontal line */}
      <div className="border-t border-gray-200 mt-2 md:mt-3" />
    </section>
  );
};

export default StatsSection;
