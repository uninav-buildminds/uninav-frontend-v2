import React from "react";
import { FileText, Users, Timer } from "lucide-react";
import { ChallengeFeatures } from "./ui/challenge-features";
import ChallengeBadge from "./badges/ChallengeBadge";

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
      <div className="container mx-auto max-w-6xl px-4 md:px-6 text-center py-12 md:py-16">
        <ChallengeBadge text="The Challenge" className="mb-6" />
        <h2 className="text-3xl text-foreground md:text-4xl lg:text-5xl font-semibold mb-6">
          Navigating the Academic Maze
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Students often struggle with fragmented resources, limited collaboration, and time constraints, hindering their academic success.
        </p>
      </div>
      <ChallengeFeatures challenges={challenges} />
    </section>
  );
};

export default ChallengeSection;
