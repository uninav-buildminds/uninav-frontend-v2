import { Navigate } from "react-router-dom";
import { ReactNode, useContext } from "react";
import AuthContext from "@/context/authentication/AuthContext";

interface AuthRedirectProps {
  children: ReactNode;
  routePath?: string;
}

/**
 * For redirecting authenticated users away from auth pages (e.g., signin, signup)
 * to a specified route (default is /dashboard).
 * If the user is not authenticated, it renders the child components (the auth page).
 * While authentication status is being determined, it shows a loading spinner.
 * @returns JSX.Element
 */
export const AuthRedirect = ({ children, routePath = "/dashboard" }: AuthRedirectProps) => {
  const { user, isLoading } = useContext(AuthContext);

  // If user is not authenticated and is loading, show loading spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard or specified route
  if (user) {
    return <Navigate to={routePath} replace />;
  }


  // If user is not authenticated, render the page
  return <>{children}</>;
};

/**
 * For protecting routes that require authentication.
 * If the user is authenticated, it renders the child components (the protected page).
 * If the user is not authenticated, it redirects to a specified route (default is signin page).
 * While authentication status is being determined, it shows a loading spinner.
 * @returns JSX.Element
 */
export const ProtectedRoute = ({ children, routePath = "/auth/signin" }: AuthRedirectProps) => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand"></div>
      </div>
    )
  }

  // If user is not authenticated, redirect to signin page
  if (!user) {
    return <Navigate to={routePath} replace />;
  }

  // If user is authenticated, render the protected page
  return <>{children}</>;
};