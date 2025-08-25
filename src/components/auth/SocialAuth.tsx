import React from "react";

const SocialAuth: React.FC<{ onGoogle?: () => void }> = ({ onGoogle }) => {
  return (
    <div>
      <button
        type="button"
        onClick={onGoogle}
        className="inline-flex items-center justify-center w-full gap-2 rounded-xl border hover:bg-gray-50 py-3"
        aria-label="Continue with Google"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
        <span className="text-sm">Continue with Google</span>
      </button>
    </div>
  );
};

export default SocialAuth;
