import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import Header from "@/components/Header";

const SignupSuccess: React.FC = () => {
  return (
    <AuthLayout>
      <Header />
      <AuthCard>
        <div className="text-center">
          <div className="mb-5 sm:mb-6 flex justify-center">
            <img src="/assets/onboarding/success.svg" alt="Success" className="h-28 sm:h-36 w-auto" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">You've successfully created an account on Uninav!</h1>
          {/* Should route to dashboard when it is implemented */}
          <a href="/" className="inline-flex w-full justify-center rounded-xl bg-brand hover:bg-brand/90 text-white py-3 text-sm font-medium transition-colors">
            View Dashboard
          </a>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default SignupSuccess;
