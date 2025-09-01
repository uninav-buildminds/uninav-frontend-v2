import React, { useState } from "react";
import { Link } from "react-router-dom";
import LoadingButton from "./LoadingButton";

interface CheckInboxCardProps {
  title: string;
  message: string;
  buttonText: string;
  backLink: string;
  backText: string;
  resendHandler?: () => Promise<void>;
}

const CheckInboxCard: React.FC<CheckInboxCardProps> = ({
  title,
  message,
  buttonText,
  backLink,
  backText,
  resendHandler,
}) => {
  const [isResending, setIsResending] = useState(false);
  return (
    <div className="text-center">
      <div className="mb-5 sm:mb-6 flex justify-center">
        <img src="/assets/onboarding/message.svg" alt="Verify email" className="h-24 sm:h-32 w-auto" />
      </div>
      <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6 sm:mb-8">
        {message}
      </p>
      <a 
        href="https://mail.google.com" 
        target="_blank" 
        rel="noreferrer" 
        className="inline-flex w-full justify-center rounded-xl bg-brand hover:bg-brand/90 text-white py-3 text-sm font-medium transition-colors"
      >
        {buttonText}
      </a>
      {resendHandler && (
        <p className="mt-4 text-xs text-muted-foreground">
          Didn't receive the email? <button onClick={async () => {
            setIsResending(true);
            try {
              await resendHandler();
            } finally {
              setIsResending(false);
            }
          }} className="text-brand underline" disabled={isResending}>
            {isResending ? "Resending link..." : "Resend"}
          </button>
        </p>
      )}
      <p className="mt-2 text-xs">
        <Link className="text-brand underline" to={backLink}>{backText}</Link>
      </p>
    </div>
  );
};

export default CheckInboxCard;
