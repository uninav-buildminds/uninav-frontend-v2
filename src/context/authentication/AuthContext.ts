import { createContext } from "react";
import { UserProfile } from "@/lib/types/user.types";

interface AuthContextType {
  refreshAuthState: () => Promise<void>;
  logIn: (emailOrMatricNo: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  user?: UserProfile;
  setUser: (user: UserProfile) => void;
  isValidating: boolean;
  isLoading: boolean;
  authInitializing: boolean; // true while initial auth (cookie/session) check + first user fetch (if logged in) are in flight
}

const AuthContext = createContext<AuthContextType | null>(null);
export default AuthContext;
