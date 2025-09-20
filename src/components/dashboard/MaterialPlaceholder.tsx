import React from "react";
import { File01Icon } from "hugeicons-react";

interface MaterialPlaceholderProps {
  name: string;
  className?: string;
}

const MaterialPlaceholder: React.FC<MaterialPlaceholderProps> = ({ name, className = "" }) => {
  // Generate a consistent color based on the name
  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-purple-100 text-purple-600",
    "bg-orange-100 text-orange-600",
    "bg-pink-100 text-pink-600",
    "bg-indigo-100 text-indigo-600",
    "bg-teal-100 text-teal-600",
    "bg-red-100 text-red-600",
  ];
  
  const colorIndex = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const colorClass = colors[colorIndex];

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-4 ${colorClass} ${className}`}>
      <File01Icon size={32} className="mb-2" />
      <div className="text-center">
        <div className="text-xs font-medium mb-1">File Preview</div>
        <div className="text-xs opacity-75">{name}</div>
      </div>
    </div>
  );
};

export default MaterialPlaceholder;
