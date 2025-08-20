import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import ChallengeSection from "@/components/ChallengeSection";
import SolutionSection from "@/components/SolutionSection";
import FeatureSection from "@/components/FeatureSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <StatsSection />
      <ChallengeSection />
      <SolutionSection />
      <FeatureSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;
