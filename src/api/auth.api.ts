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
    const response = await httpClient("/auth/student", {
		method: "POST",
		body: signupData,
	});
    const responseBody = await response.json();
    if (response.ok) {
        return responseBody;
    }
    throw {
        statusCode: response.status,
        message:
            responseBody?.message || "Signup failed. Please try again.",
    };
}
    
/**
 * Sends login request to backend
 * @param emailOrMatricNo
 * @param password
 * @returns response body
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function login(emailOrMatricNo: string, password: string) {
    const response = await httpClient("/auth/login", {
        method: "POST",
        body: {
            emailOrMatricNo,
            password,
        },
    });
    const responseBody = await response.json();
    if (response.ok) {
        return responseBody;
    }
    throw {
        statusCode: response.status,
        message:
            responseBody?.message || "Login failed. Please try again.",
    };
}

/**
 * Sends logout request to backend
 * @returns response body
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function logOut() {
    const response = await httpClient("/auth/logout", {
        method: "POST",
    });
    const responseBody = await response.json();
    if (response.ok) {
        return responseBody;
    }
    throw {
        statusCode: response.status,
        message:
            responseBody?.message || "Logout failed. Please try again.",
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
    const response = await httpClient("/auth/forgot-password", {
        method: "POST",
        body: {
            email,
        },
    });
    const responseBody = await response.json();
    if (response.ok) {
        return responseBody;
    }
    throw {
        statusCode: response.status,
        message:
            responseBody?.message || "Something went wrong. Please try again.",
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
    const response = await httpClient("/auth/reset-password", {
        method: "POST",
        body: {
            token,
            newPassword,
        },
    });
    const responseBody = await response.json();
    if (response.ok) {
        return responseBody;
    }
    throw {
		statusCode: response.status,
		message:
			responseBody?.message || "Something went wrong. Please try again.",
	};
}

/**
 * Request to send verification email to the user
 * @param email User's email address
 * @returns Response body from the server
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function requestEmailVerification(email: string) {
    const response = await httpClient("/auth/resend-verification", {
        method: "POST",
        body: {
            email,
        },
    });
    const responseBody = await response.json();
    if (response.ok) {
        return responseBody;
    }
    throw {
        statusCode: response.status,
        message:
            responseBody?.message || "Failed to resend verification email. Please try again.",
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
    const response = await httpClient(
		`/auth/verify-email/token?token=${encodeURIComponent(token)}`,
		{ method: "GET" }
	);
    const responseBody = await response.json();
    if (response.ok) {
        return responseBody;
    }
    throw {
        statusCode: response.status,
        message:
            responseBody?.message || "Email verification failed. Please try again.",
    };
}