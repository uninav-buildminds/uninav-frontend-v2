import { createContext } from "react";
import { UserProfile } from "@/lib/types/user.types";


interface AuthContextType {
    refreshAuthState: () => Promise<void>;
    logIn: (emailOrMatricNo: string, password: string) => Promise<void>;
    logOut: () => Promise<void>;
    user?: UserProfile;
    isValidating: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
export default AuthContext;
