import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import ChallengeSection from "@/components/ChallengeSection";
import SolutionSection from "@/components/SolutionSection";
import FeatureSection from "@/components/FeatureSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { getAuthState, getRedirectPath, clearRedirectPath } from "@/lib/authStorage";
import { useEffect, useState } from "react";

const Index = () => {
  const { user, authInitializing } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Check localStorage first for instant redirect
  useEffect(() => {
    const localStorageAuthState = getAuthState();
    if (localStorageAuthState === true) {
      setShouldRedirect(true);
    }
  }, []);

  // Instant redirect if localStorage says logged in
  if (shouldRedirect && !authInitializing) {
    const redirectPath = getRedirectPath() || "/dashboard";
    clearRedirectPath(); // Clear redirect path after using it
    return <Navigate to={redirectPath} replace />;
  }

  // Show loading while checking authentication
  if (authInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand" />
      </div>
    );
  }

  // If user is authenticated, redirect to stored path or dashboard
  if (user) {
    const redirectPath = getRedirectPath() || "/dashboard";
    clearRedirectPath(); // Clear redirect path after using it
    return <Navigate to={redirectPath} replace />;
  }

  // If user is not authenticated, show landing page
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
