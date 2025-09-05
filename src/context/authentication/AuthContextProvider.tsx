import { useCallback } from "react";
import { logOut as apiLogOut, login as apiLogin } from "@/api/auth.api";
import { toast } from "sonner";
import { googleLogout } from "@react-oauth/google";
import AuthContext from "./AuthContext";
import { httpClient } from "@/api/api";
import useSWR from "swr";

/**
 * Fetches the profile of the currently authenticated user
 * @returns user profile data
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
async function fetcher(url: string) {
    const response = await httpClient(url);
    const responseBody = await response.json();
    if (response.ok) {
        return responseBody.data;
    }
    throw {
        statusCode: response.status,
        message:
            responseBody?.message || "Fetching user profile failed. Please try again.",
    };
}

interface AuthContextProviderProps {
    children: React.ReactNode;
}
// Use the isLoading and isValidating states with user to keep track of auth state
// isLoading is true when the request is in flight for the first time (user is null)
// isValidating is true when the request is in flight and during revalidation (user can be non-null)
export default function AuthContextProvider({ children }: AuthContextProviderProps) {
    const { mutate, data: user, isValidating, isLoading } = useSWR("/user/profile", fetcher);

    const logIn = useCallback(
        async (emailOrMatricNo: string, password: string) => {
            try {
                const userProfile = await apiLogin(emailOrMatricNo, password);
                mutate(userProfile, { optimisticData: userProfile });
            } catch (error) {
                toast.error(error.message);
            }
        },
        [mutate]
    );

    const logOut = useCallback(async () => {
        try {
            googleLogout();
            await apiLogOut();
            mutate(null);
        } catch (error) {
            toast.error("Logout failed. Please try again.");
        }
    }, [mutate]);

    return (
        <AuthContext.Provider value={{ refreshAuthState: mutate, logIn, logOut, user, isValidating, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
