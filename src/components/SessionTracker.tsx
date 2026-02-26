import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveLastTool } from "@/utils/sessionTracker";

/**
 * Silently watches the current route and writes the last visited tool
 * path to sessionStorage. Renders nothing.
 */
const SessionTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    saveLastTool(location.pathname, location.search);
  }, [location.pathname, location.search]);

  return null;
};

export default SessionTracker;
