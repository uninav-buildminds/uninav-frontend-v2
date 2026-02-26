import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { setRedirectPath } from "@/lib/authStorage";

const SUBDOMAIN_MAP: Record<string, string> = {
  material: "/dashboard",
  club: "/clubs",
  guide: "/guides",
};

const BASE_DOMAIN = "uninav.live";

/**
 * Detects *.uninav.live subdomains and redirects accordingly.
 * - Authenticated: navigates directly to the target route.
 * - Unauthenticated: stores redirect path then sends to /auth/signin.
 * Fires only once per mount. Only acts when the current path is "/".
 */
const SubdomainRouter: React.FC = () => {
  const navigate = useNavigate();
  const { user, authInitializing } = useAuth();
  const firedRef = useRef(false);

  useEffect(() => {
    if (authInitializing) return;
    if (firedRef.current) return;

    const hostname = window.location.hostname;
    const parts = hostname.split(".");

    // Need at least subdomain + domain + tld (3 parts) and base must be uninav.live
    if (parts.length < 3) return;
    const baseDomain = parts.slice(-2).join(".");
    if (baseDomain !== BASE_DOMAIN) return;

    const subdomain = parts.slice(0, -2).join(".");
    const targetRoute = SUBDOMAIN_MAP[subdomain];
    if (!targetRoute) return;

    // Only redirect from root
    if (window.location.pathname !== "/") return;

    firedRef.current = true;

    if (user) {
      navigate(targetRoute, { replace: true });
    } else {
      setRedirectPath(targetRoute);
      navigate("/auth/signin", { replace: true });
    }
  }, [authInitializing, user, navigate]);

  return null;
};

export default SubdomainRouter;
