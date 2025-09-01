import React, { useEffect } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import CheckInboxCard from "@/components/auth/CheckInboxCard";
import LoadingButton from "@/components/auth/LoadingButton";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { requestEmailVerification } from "@/api/auth.api";

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
    try {
      await requestEmailVerification(email);
      toast("Verification email sent!");
    } catch (error) {
      toast.error(error.message);
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
