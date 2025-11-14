import { useCallback, useEffect, useRef, useState } from "react";
import {
  logOut as apiLogOut,
  login as apiLogin,
  isClientAuthenticated,
  signInWithOneTap,
} from "@/api/auth.api";
import { googleLogout, useGoogleOneTapLogin } from "@react-oauth/google";
import AuthContext from "./AuthContext";
import { httpClient } from "@/api/api";
import useSWR from "swr";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/lib/types/user.types";

/**
 * Fetches the profile of the currently authenticated user
 * @returns user profile data
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
async function fetcher(url: string) {
  const response = await httpClient.get(url);
  if (response.status === 200) {
    return response.data.data;
  }
  throw {
    statusCode: response.status,
    message:
      response.data?.message ||
      "Fetching user profile failed. Please try again.",
  };
}

interface AuthContextProviderProps {
  children: React.ReactNode;
}
// Use the isLoading and isValidating states with user to keep track of auth state
// isLoading is true when the request is in flight for the first time (user is null)
// isValidating is true when the request is in flight and during revalidation (user can be non-null)
export default function AuthContextProvider({
  children,
}: AuthContextProviderProps) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showOneTap, setShowOneTap] = useState(false);
  const initialAuthCheckDoneRef = useRef(false);
  const {
    mutate,
    data: user,
    isValidating,
    isLoading,
  } = useSWR(loggedIn ? "/user/profile" : null, fetcher, {
    revalidateOnFocus: false, // avoid refetch on route focus changes
    dedupingInterval: 120000, // 2 min dedupe window
    focusThrottleInterval: 60000, // throttle any accidental focus events
    revalidateOnReconnect: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    isClientAuthenticated().then((status) => {
      if (!active) return;
      setLoggedIn(status);
      setShowOneTap(status === false);
      initialAuthCheckDoneRef.current = true;
    });
    return () => {
      active = false;
    };
  }, []);

  useGoogleOneTapLogin({
    onSuccess: (credentialResponse) =>
      signInWithOneTap(
        credentialResponse,
        () => {
          navigate("/dashboard");
          window.location.reload();
        },
        () => {
          toast.error("Google One Tap login failed");
        }
      ),
    onError: () => {
      toast.error("Google One Tap login failed");
    },
    disabled: user !== undefined || isLoading || !showOneTap,
  });

  const logIn = useCallback(
    async (emailOrMatricNo: string, password: string) => {
      const userProfile = await apiLogin({ emailOrMatricNo, password });
      console.log(userProfile)
      mutate(userProfile); // Update the user data without revalidating
      setLoggedIn(true);
    },
    [mutate]
  );

  const logOut = useCallback(async () => {
    googleLogout();
    await apiLogOut();
    window.location.reload();
  }, []);

  const setUser = useCallback(
    (newUser: UserProfile) => {
      mutate(newUser, false); // Update the cache, don't revalidate
    },
    [mutate]
  );

  // authInitializing: before initial cookie/session check completes OR (loggedIn && first user fetch still loading)
  const authInitializing =
    !initialAuthCheckDoneRef.current || (loggedIn && isLoading && !user);

  return (
    <AuthContext.Provider
      value={{
        refreshAuthState: mutate,
        logIn,
        logOut,
        user,
        setUser,
        isValidating,
        isLoading,
        authInitializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
