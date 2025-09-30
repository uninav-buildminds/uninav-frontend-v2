import React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value = "",
  onChange,
  options,
  placeholder = "Select an option...",
  disabled = false,
  className = "",
  label,
  error,
}) => {
  return (
    <div className={cn("relative w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "w-full py-2 pl-3 pr-10 text-sm leading-5 bg-white border rounded-lg transition-all duration-200 appearance-none",
            "focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:shadow-sm",
            "hover:border-gray-400 hover:shadow-sm",
            disabled
              ? "cursor-not-allowed opacity-50 bg-gray-50 text-gray-400"
              : "cursor-pointer text-gray-900",
            error
              ? "border-red-500 focus:ring-red-200 focus:border-red-500"
              : "border-gray-300",
            "shadow-sm"
          )}
        >
          <option value="" disabled className="text-gray-500 bg-white">
            {placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={cn(
                "text-gray-900 bg-white py-2",
                option.disabled && "opacity-50 text-gray-400"
              )}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDownIcon
            className={cn(
              "h-4 w-4 transition-colors duration-200",
              disabled ? "text-gray-400" : "text-gray-500"
            )}
            aria-hidden="true"
          />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600" id="error">
          {error}
        </p>
      )}
    </div>
  );
};

export default CustomSelect;
