import { UserProfile } from "@/lib/types/user.types";
import { useCallback, useEffect, useState } from "react";
import { logOut as apiLogOut, login as apiLogin } from "@/api/auth.api";
import { getUserProfile } from "@/api/user.api";
import { toast } from "sonner";
import { googleLogout } from "@react-oauth/google";

/**
 * Custom hook to manage user authentication state and actions.
 */
export default function useAuth() {
	const [user, setUser] = useState<UserProfile | null>(null);

	const refreshAuthState = useCallback(async () => {
		try {
			const userProfile = await getUserProfile();
			setUser(userProfile);
		} catch (error) {
			setUser(null);
		}
	}, []);

	const logIn = useCallback(
		async (emailOrMatricNo: string, password: string) => {
			try {
				const userProfile = await apiLogin(emailOrMatricNo, password);
				setUser(userProfile);
			} catch (error) {
				toast.error(error.message);
			}
		},
		[]
	);

	const logOut = useCallback(async () => {
		try {
			googleLogout();
			await apiLogOut();
			setUser(null);
		} catch (error) {
			toast.error("Logout failed. Please try again.");
			console.error("Logout failed:", error);
		}
	}, []);

	useEffect(() => {
		refreshAuthState();
	}, [refreshAuthState]);
	

	return {
		refreshAuthState,
		logIn,
		logOut,
		user,
	};
}
