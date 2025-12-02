import { Navigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { isClientAuthenticated } from "@/api/auth.api";
import { useAuth } from "@/hooks/useAuth";
import { getAuthState } from "@/lib/authStorage";

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
  // Check localStorage first for instant redirect
  const localStorageAuthState = getAuthState();
  const [isLoading, setIsLoading] = useState(true);
  const [clientIsAuthenticated, setClientIsAuthenticated] = useState(localStorageAuthState === true);

  useEffect(() => {
    // If localStorage says logged in, verify with server
    if (localStorageAuthState === true) {
      isClientAuthenticated().then(status => {
        setClientIsAuthenticated(status);
        setIsLoading(false);
      });
    } else {
      // If localStorage says not logged in, still verify with server but don't wait
      isClientAuthenticated().then(status => {
        setClientIsAuthenticated(status);
        setIsLoading(false);
      });
    }
  }, [localStorageAuthState]);

  // Instant redirect if localStorage says logged in (optimistic)
  if (localStorageAuthState === true && !isLoading) {
    return <Navigate to={routePath} replace />;
  }

  // If user is not authenticated and is loading, show loading spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard or specified route
  if (clientIsAuthenticated) {
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
  const { user, authInitializing } = useAuth();
  const localStorageAuthState = getAuthState();

  // If localStorage says not logged in, redirect immediately (no need to wait for server)
  if (localStorageAuthState === false && !authInitializing) {
    return <Navigate to={routePath} replace />;
  }

  if (authInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={routePath} replace />;
  }
  return <>{children}</>;
};