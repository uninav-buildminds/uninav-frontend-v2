import React from "react";

type AuthHeaderProps = {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
};

const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle, showLogo = true }) => {
  return (
    <div className="text-center mb-8">
      {showLogo && (
        <div className="mb-3 flex justify-center">
          <img src="/assets/logo.svg" alt="UniNav logo" className="h-8 w-auto" />
        </div>
      )}
      <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{subtitle}</p>
      )}
    </div>
  );
};

export default AuthHeader;
