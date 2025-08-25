import React from "react";
import { Mail } from "lucide-react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { id: string };

const EmailInput = React.forwardRef<HTMLInputElement, Props>(({ id, ...props }, ref) => {
  return (
    <div className="relative">
      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        id={id}
        type="email"
        ref={ref}
        className="w-full rounded-xl border pl-9 pr-3 py-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-brand/30"
        {...props}
      />
    </div>
  );
});

EmailInput.displayName = "EmailInput";

export default EmailInput;
