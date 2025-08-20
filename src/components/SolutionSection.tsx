import React from "react";
import { SolutionBadge } from "./badges";

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
    <section className="bg-[#010323]">
      <div className="container mx-auto max-w-6xl px-4 md:px-6 text-center py-16 md:py-20">
        <div className="mb-8">
          <SolutionBadge text="Our Solution" />
        </div>
        
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-6 text-white">
          Empowering Your Academic Journey
        </h2>
        
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-16">
          UniNav offers a comprehensive solution to these challenges, providing a centralized resource hub, fostering a collaborative learning community, and equipping students with efficient study tools.
        </p>

        <div className="space-y-16 md:space-y-20">
          {solutions.map((solution, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-12`}>
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
              <div className="w-full md:w-1/2 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                  {solution.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed text-base">
                  {solution.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
