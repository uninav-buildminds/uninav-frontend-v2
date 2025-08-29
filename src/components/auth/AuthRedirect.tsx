import { Navigate } from "react-router-dom";
import useAuth from "@/hooks/use-auth";
import { ReactNode } from "react";

interface AuthRedirectProps {
  children: ReactNode;
}

/**
 * Component that redirects authenticated users to the homepage
 * and renders children for unauthenticated users
 */
const AuthRedirect = ({ children }: AuthRedirectProps) => {
  const { user } = useAuth();

  // If user is authenticated, redirect to homepage
  if (user) {
    return <Navigate to="/" replace />;
  }

  // If user is not authenticated, render the auth page
  return <>{children}</>;
};

export default AuthRedirect;
