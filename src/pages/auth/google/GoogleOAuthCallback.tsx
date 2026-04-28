import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import { Loader } from "lucide-react";
import { setAuthToken } from "@/lib/authToken";
import { getRedirectPath, clearRedirectPath } from "@/lib/authStorage";

const GoogleOAuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash || "";
    const token = new URLSearchParams(hash.replace("#", "")).get("token");

    if (token) {
      setAuthToken(token);
      const redirectPath = getRedirectPath() || "/home";
      clearRedirectPath();
      navigate(redirectPath, { replace: true });
      window.location.reload();
    } else {
      navigate("/auth/signin", { replace: true });
    }
  }, [navigate]);

  return (
    <AuthLayout>
      <AuthCard>
        <h1 className="text-center text-2xl font-semibold mb-4">
          Completing Google sign-in
        </h1>
        <Loader className="mx-auto animate-spin" size={64} />
      </AuthCard>
    </AuthLayout>
  );
};

export default GoogleOAuthCallback;
