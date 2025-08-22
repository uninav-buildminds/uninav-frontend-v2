import React, { useEffect, useRef } from "react";
import { motion, useInView, animate, useMotionValue, useTransform } from "framer-motion";

const CountUp = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, latest => Math.floor(latest));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1]
    });
    return () => controls.stop();
  }, [motionValue, value]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>{suffix}
    </span>
  );
};

const StatsSection: React.FC = () => {
  const stats = [
    { number: "50+", label: "Students" },
    { number: "100+", label: "Courses" },
    { number: "3+", label: "Departments" },
    { number: "100+", label: "Resources" },
  ];

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(containerRef, { once: true, margin: "0px 0px -20% 0px" });

  const parseNumber = (text: string) => {
    const match = text.match(/^(\d+)(.*)$/);
    if (!match) return { value: 0, suffix: "" };
    return { value: Number(match[1]), suffix: match[2] };
  };

  return (
    <section className="bg-white">
      {/* Top horizontal line */}
      <div className="border-t border-gray-200 mb-2 md:mb-3" />
      
      <div className="container mx-auto max-w-6xl px-4 md:px-6 py-3 sm:py-4 md:py-6" ref={containerRef}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const { value, suffix } = parseNumber(stat.number);
            return (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
                  {inView ? <CountUp value={value} suffix={suffix} /> : stat.number}
                </div>
                <div className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Bottom horizontal line */}
      <div className="border-t border-gray-200 mt-2 md:mt-3" />
    </section>
  );
};

export default StatsSection;
