import React from "react";
import BackButton from "./BackButton";

type AuthCardProps = {
  children: React.ReactNode;
  backButtonText?: string;
  backButtonPath?: string;
};

const AuthCard: React.FC<AuthCardProps> = ({ 
  children, 
  backButtonText = "Back to home", 
  backButtonPath = "/" 
}) => {
  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border bg-white/90 shadow-[0_6px_24px_rgba(0,0,0,0.06)] backdrop-blur supports-[backdrop-filter]:bg-white/75 relative">
      <BackButton helperText={backButtonText} to={backButtonPath} />
      <div className="px-4 sm:px-8 py-8 sm:py-12">{children}</div>
    </div>
  );
};

export default AuthCard;
