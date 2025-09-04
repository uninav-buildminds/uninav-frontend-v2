import React, { useEffect, useRef, useState } from "react";
import MetricCard from "./MetricCard";
import { motion } from "framer-motion";

interface Metric {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
}

interface MetricsSectionProps {
  metrics: Metric[];
}

const MetricsSection: React.FC<MetricsSectionProps> = ({ metrics }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % metrics.length;
        scrollToIndex(nextIndex);
        return nextIndex;
      });
    }, 3000); // Auto-scroll every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoScrolling, metrics.length]);

  const scrollToIndex = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = container.clientWidth; // Full width on mobile
    const scrollPosition = index * cardWidth;
    
    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const cardWidth = container.clientWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const handleMouseEnter = () => setIsAutoScrolling(false);
  const handleMouseLeave = () => setIsAutoScrolling(true);

  return (
    <div className="space-y-4">
      {/* Desktop Grid */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            icon={metric.icon}
            title={metric.title}
            value={metric.value}
            description={metric.description}
          />
        ))}
      </div>

      {/* Mobile/Tablet Horizontal Scroll */}
      <div className="lg:hidden">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full sm:w-1/2 snap-center"
              style={{ scrollSnapAlign: 'center' }}
            >
              <MetricCard
                icon={metric.icon}
                title={metric.title}
                value={metric.value}
                description={metric.description}
              />
            </div>
          ))}
        </div>

        {/* Swiper Indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {metrics.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                scrollToIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-brand w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to metric ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetricsSection;
