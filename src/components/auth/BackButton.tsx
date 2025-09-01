import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type BackButtonProps = {
  helperText?: string;
  to?: string;
};

const BackButton: React.FC<BackButtonProps> = ({ 
  helperText = "Back", 
  to = "/" 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        <span>{helperText}</span>
      </button>
    </div>
  );
};

export default BackButton;