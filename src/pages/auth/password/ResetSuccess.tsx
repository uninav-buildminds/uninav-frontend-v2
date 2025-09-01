import React from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import { useNavigate } from "react-router-dom";

const ResetSuccess: React.FC = () => {
  const navigate = useNavigate();
  return (
    <AuthLayout>
      <AuthCard>
        <div className="text-center">
          <div className="mb-5 sm:mb-6 flex justify-center">
            <img src="/assets/onboarding/success.svg" alt="Success" className="h-28 sm:h-36 w-auto" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">You've successfully created a new password!</h1>
          <button 
            onClick={() => navigate("/auth/signin")} 
            className="inline-flex w-full justify-center rounded-xl bg-brand hover:bg-brand/90 text-white py-3 text-sm font-medium transition-colors"
          >
            Log in
          </button>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default ResetSuccess;
