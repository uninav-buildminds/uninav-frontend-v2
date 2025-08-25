import React from "react";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
};

const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, error, children }) => {
  return (
    <div className="w-full">
      <label htmlFor={htmlFor} className="block text-xs font-medium text-foreground mb-2">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-2 text-xs text-red-600" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
