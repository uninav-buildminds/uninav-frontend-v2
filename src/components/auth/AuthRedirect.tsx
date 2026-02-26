import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { isClientAuthenticated } from "@/api/auth.api";
import { useAuth } from "@/hooks/useAuth";
import {
  getAuthState,
  getRedirectPath,
  setRedirectPath,
  clearRedirectPath,
} from "@/lib/authStorage";

interface AuthRedirectProps {
  children: ReactNode;
  routePath?: string;
}

/**
 * For redirecting authenticated users away from auth pages (e.g., signin, signup)
 * to a specified route (default is /dashboard) or stored redirect path.
 * If the user is not authenticated, it renders the child components (the auth page).
 * While authentication status is being determined, it shows a loading spinner.
 * @returns JSX.Element
 */
export const AuthRedirect = ({
  children,
  routePath = "/home",
}: AuthRedirectProps) => {
  // Check localStorage first for instant redirect
  const localStorageAuthState = getAuthState();
  const [isLoading, setIsLoading] = useState(true);
  const [clientIsAuthenticated, setClientIsAuthenticated] = useState(
    localStorageAuthState === true
  );

  useEffect(() => {
    // If localStorage says logged in, verify with server
    if (localStorageAuthState === true) {
      isClientAuthenticated().then((status) => {
        setClientIsAuthenticated(status);
        setIsLoading(false);
      });
    } else {
      // If localStorage says not logged in, still verify with server but don't wait
      isClientAuthenticated().then((status) => {
        setClientIsAuthenticated(status);
        setIsLoading(false);
      });
    }
  }, [localStorageAuthState]);

  // Get redirect path from localStorage if available
  const redirectPath = getRedirectPath() || routePath;

  // Instant redirect if localStorage says logged in (optimistic)
  if (localStorageAuthState === true && !isLoading) {
    clearRedirectPath(); // Clear redirect path after using it
    return <Navigate to={redirectPath} replace />;
  }

  // If user is not authenticated and is loading, show loading spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to stored path or dashboard
  if (clientIsAuthenticated) {
    clearRedirectPath(); // Clear redirect path after using it
    return <Navigate to={redirectPath} replace />;
  }

  // If user is not authenticated, render the page
  return <>{children}</>;
};

/**
 * For protecting routes that require authentication.
 * If the user is authenticated, it renders the child components (the protected page).
 * If the user is not authenticated, it redirects to a specified route (default is signin page)
 * and stores the current path for redirect after authentication.
 * For folder/material routes, redirects to public view routes instead of sign-in.
 * While authentication status is being determined, it shows a loading spinner.
 * @returns JSX.Element
 */
export const ProtectedRoute = ({
  children,
  routePath = "/auth/signin",
}: AuthRedirectProps) => {
  const { user, authInitializing } = useAuth();
  const localStorageAuthState = getAuthState();
  const location = useLocation();

  // Helper function to check if current path is a folder or material route and get public redirect
  const getPublicRedirectPath = (): string | null => {
    const pathname = location.pathname;

    // Check for folder route: /dashboard/folder/:slug
    const folderMatch = pathname.match(/^\/dashboard\/folder\/(.+)$/);
    if (folderMatch) {
      return `/view/folder/${folderMatch[1]}`;
    }

    // Check for material route: /dashboard/material/:slug
    const materialMatch = pathname.match(/^\/dashboard\/material\/(.+)$/);
    if (materialMatch) {
      return `/view/material/${materialMatch[1]}`;
    }

    return null;
  };

  // Helper function to store redirect path if current path is not an auth page
  const storeRedirectPathIfNeeded = () => {
    const currentPath = location.pathname + location.search;
    // Only store if not already on auth page or homepage
    if (
      currentPath &&
      !currentPath.startsWith("/auth") &&
      currentPath !== "/"
    ) {
      setRedirectPath(currentPath);
    }
  };

  // If localStorage says not logged in, redirect immediately (no need to wait for server)
  if (localStorageAuthState === false && !authInitializing) {
    // Check if this is a folder/material route and redirect to public view
    const publicRedirect = getPublicRedirectPath();
    if (publicRedirect) {
      return <Navigate to={publicRedirect} replace />;
    }

    storeRedirectPathIfNeeded();
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
    // Check if this is a folder/material route and redirect to public view
    const publicRedirect = getPublicRedirectPath();
    if (publicRedirect) {
      return <Navigate to={publicRedirect} replace />;
    }

    storeRedirectPathIfNeeded();
    return <Navigate to={routePath} replace />;
  }
  return <>{children}</>;
};
