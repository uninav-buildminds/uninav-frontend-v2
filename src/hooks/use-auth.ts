import { UserProfile } from "@/lib/types/user.types";
import { API_BASE_URL } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

/**
 * Custom hook to manage user authentication state and actions.
 */
export default function useAuth() {
	const [user, setUser] = useState<UserProfile | null>(null);

	const refreshAuthState = useCallback(async () => {
		const response = await fetch(`${API_BASE_URL}/user/profile`, {
			credentials: "include",
		});
		if (response.ok) {
			const data = await response.json();
			console.log(data.data);
			setUser(data.data);
		} else {
			setUser(null);
		}
	}, []);

	const logOut = useCallback(async () => {
		const response = await fetch(`${API_BASE_URL}/auth/logout`, {
			method: "POST",
			credentials: "include",
		});
		if (response.ok) {
			setUser(null);
		}
	}, []);

	useEffect(() => {
		refreshAuthState();
	}, [refreshAuthState]);
	

	return {
		refreshAuthState,
		logOut,
		user,
	};
}
