import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { id: string };

const PasswordInput = React.forwardRef<HTMLInputElement, Props>(({ id, ...props }, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        id={id}
        type={visible ? "text" : "password"}
        ref={ref}
        className="w-full rounded-xl border pl-9 pr-10 py-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-brand/30"
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
