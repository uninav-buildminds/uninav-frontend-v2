import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import CheckInboxCard from "@/components/auth/CheckInboxCard";

const CheckInbox: React.FC = () => {
  return (
    <AuthLayout>
      <AuthCard>
        <CheckInboxCard
          title="Check your inbox!"
          message="We've sent a password reset link to your email. It will expire in 1 hour for security."
          buttonText="Go to mail"
          backLink="/auth/signin"
          backText="Back to Login"
        />
      </AuthCard>
    </AuthLayout>
  );
};

export default CheckInbox;
