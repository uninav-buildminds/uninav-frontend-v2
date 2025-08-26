import React, { useEffect } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import CheckInboxCard from "@/components/auth/CheckInboxCard";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "@/lib/utils";
import { toast } from "sonner";

const RequestEmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      navigate("/auth/signup");
    }
  }, [email, navigate]);

  async function resendVerificationEmail() {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      toast("Verification email sent!");
      return;
    } else {
      const error = await response.json();
      toast.error(error?.message || "Failed to resend verification email. Please try again.");
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <CheckInboxCard
          title="Check your email"
          message="We've sent a verification link to your email address. Click the link to verify your account and complete your registration."
          buttonText="Open email"
          backLink="/auth/signup"
          backText="Back to signup"
          resendHandler={email ? resendVerificationEmail : undefined}
        />
      </AuthCard>
    </AuthLayout>
  );
};

export default RequestEmailVerification;
