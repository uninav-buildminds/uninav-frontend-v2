import { CredentialResponse } from "@react-oauth/google";
import { httpClient } from "./api";

export interface SignUpData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    departmentId: string;
    level: number;
}
/**
 * Sends signup request to backend
 * @param signupData
 * @returns response body
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function signUp(signupData: SignUpData) {
    const response = await httpClient.post("/auth/student", signupData);
    if (response.status === 200) {
        return response.data;
    }
    throw {
        statusCode: response.status,
        message:
            response.data?.message || "Signup failed. Please try again.",
    };
}

/**
 * Handles sign-in with Google One Tap
 * @param credentialResponse Response from Google One Tap
 * @param onSuccess Callback function to execute on successful login
 * @param onError Callback function to execute on login failure
 */
export async function signInWithOneTap(
	credentialResponse: CredentialResponse,
	onSuccess: () => void,
	onError: () => void
) {
	const response = await httpClient.get(
		`/auth/google/onetap?token=${credentialResponse.credential}`
	);
	if (response.status === 200) {
		return onSuccess();
	}
	return onError();
}
/**
 * Sends login request to backend
 * @param emailOrMatricNo
 * @param password
 * @returns response body
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function login(emailOrMatricNo: string, password: string) {
    const response = await httpClient.post("/auth/login", {
        emailOrMatricNo,
        password,
    });
    if (response.status === 200) {
        return response.data;
    }
    throw {
        statusCode: response.status,
        message:
            response.data?.message || "Login failed. Please try again.",
    };
}

/**
 * Sends logout request to backend
 * @returns response body
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function logOut() {
    const response = await httpClient.post("/auth/logout");
    if (response.status === 200) {
        return response.data;
    }
    throw {
        statusCode: response.status,
        message:
            response.data?.message || "Logout failed. Please try again.",
    };
}

/**
 * Initiate password reset process  
 * Backend sends an email to the user with password reset instructions
 * @param email
 * @returns response body
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function requestPasswordReset(email: string) {
    const response = await httpClient.post("/auth/forgot-password", { email });
    if (response.status === 200) {
        return response.data;
    }
    throw {
        statusCode: response.status,
        message:
            response.data?.message || "Something went wrong. Please try again.",
    };
}

/**
 * Sends password reset request to backend
 * @param token
 * @param newPassword
 * @returns response body
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function resetPassword(token: string, newPassword: string) {
    const response = await httpClient.post("/auth/reset-password", { token, newPassword });
    if (response.status === 200) {
        return response.data;
    }
    throw {
        statusCode: response.status,
        message:
            response.data?.message || "Something went wrong. Please try again.",
    };
}

/**
 * Request to send verification email to the user
 * @param email User's email address
 * @returns Response body from the server
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function requestEmailVerification(email: string) {
    const response = await httpClient.post("/auth/resend-verification", { email });
    if (response.status === 200) {
        return response.data;
    }
    throw {
        statusCode: response.status,
        message:
            response.data?.message || "Failed to resend verification email. Please try again.",
    };
}

/**
 * Verify email using the provided token
 * @param token Verification token
 * @returns Response body from the server
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function verifyEmail(token: string) {
    // The backend expects the token to be URL-encoded
    const response = await httpClient.get(`/auth/verify-email/token?token=${encodeURIComponent(token)}`);
    if (response.status === 200) {
        return response.data;
    }
    throw {
        statusCode: response.status,
        message:
            response.data?.message || "Email verification failed. Please try again.",
    };
}