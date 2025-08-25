import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import VerifyEmailCard from "@/components/auth/VerifyEmailCard";

const CheckInbox: React.FC = () => {
  return (
    <AuthLayout>
      <AuthCard>
        <VerifyEmailCard
          title="Check your inbox!"
          message="We've sent a password reset link to your email. It will expire in 1 hour for security."
          buttonText="Go to mail"
          backLink="/auth/signin"
          backText="Back to Login"
          isPasswordReset
        />
      </AuthCard>
    </AuthLayout>
  );
};

export default CheckInbox;
