import React from "react";
import { Loader2 } from "lucide-react";

type LoadingButtonProps = {
  children: React.ReactNode;
  isLoading: boolean;
  loadingText?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void;
};

const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  isLoading,
  loadingText,
  disabled = false,
  type = "submit",
  className = "",
  onClick,
}) => {
  const baseClasses = "w-full rounded-xl bg-brand hover:bg-brand/90 text-white py-3 text-sm font-medium transition-colors";
  const disabledClasses = "opacity-70 cursor-not-allowed";
  
  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      className={`${baseClasses} ${(isLoading || disabled) ? disabledClasses : ""} ${className}`}
      onClick={onClick}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          <span>{loadingText || "Loading..."}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;