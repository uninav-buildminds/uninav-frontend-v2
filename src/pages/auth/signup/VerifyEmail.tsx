import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import VerifyEmailCard from "@/components/auth/VerifyEmailCard";

const VerifyEmail: React.FC = () => {
  return (
    <AuthLayout>
      <AuthCard>
        <VerifyEmailCard
          title="Check your email"
          message="We've sent a verification link to your email address. Click the link to verify your account and complete your registration."
          buttonText="Open email"
          backLink="/auth/signup"
          backText="Back to signup"
        />
      </AuthCard>
    </AuthLayout>
  );
};

export default VerifyEmail;
