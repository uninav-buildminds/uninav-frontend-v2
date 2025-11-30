import { CredentialResponse } from "@react-oauth/google";
import { httpClient } from "./api";

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  emailOrMatricNo: string;
  password: string;
}

/**
 * Sends signup request to backend
 * @param formData - Signup form data
 * @returns response body with token and user data
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function signUp(formData: SignUpData) {
  try {
    const response = await httpClient.post("/auth/student", {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    });
    return {
      ...response.data,
      token: response.headers?.["authorization"]?.replace("Bearer ", "") || "",
    };
  } catch (error) {
    const actualError = error.data.error;
    throw {
      statusCode: actualError.statusCode || 500,
      message: actualError.cause || "Signup failed. Please try again.",
    };
  }
}

/**
 * Sends login request to backend
 * @param data - Login credentials
 * @returns response body with token and user data
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function login(data: LoginData) {
  try {
    const response = await httpClient.post("/auth/login", data);
    const authHeader = response.headers?.["authorization"] || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    return {
      token,
      data: response.data,
    };
  } catch (error) {
    const actualError = error.data.error;
    throw {
      statusCode: actualError.statusCode || 500,
      message: actualError.cause || "Login failed. Please try again.",
    };
  }
}

/**
 * Sends logout request to backend
 * @returns response body
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function logOut() {
  try {
    const response = await httpClient.post("/auth/logout");
    return response.data;
  } catch (error) {
    const actualError = error.data.error;
    throw {
      statusCode: actualError.statusCode || 500,
      message: actualError.cause || "Logout failed. Please try again.",
    };
  }
}

/**
 * Verify email using code
 * @param email - User's email
 * @param code - Verification code
 * @returns Response body from the server
 */
export async function verifyEmailByCode(email: string, code: string) {
  try {
    const response = await httpClient.post("/auth/verify-email", {
      email,
      code,
    });
    return response.data;
  } catch (error) {
    const actualError = error.data.error;
    throw {
      statusCode: actualError.statusCode || 500,
      message: actualError.cause || "Verification failed. Please try again.",
    };
  }
}

/**
 * Verify email using the provided token
 * @param token - Verification token
 * @returns Response body from the server
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function verifyEmail(token: string) {
  try {
    const response = await httpClient.get(
      `/auth/verify-email/token?token=${token}`
    );
    return response.data;
  } catch (error) {
    const actualError = error.data.error;
    throw {
      statusCode: actualError.statusCode || 500,
      message: actualError.cause || "Verification failed. Please try again.",
    };
  }
}

/**
 * Request to send verification email to the user
 * @param email - User's email address
 * @returns Response body from the server
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function requestEmailVerification(email: string) {
  try {
    const response = await httpClient.post("/auth/resend-verification", {
      email,
    });
    return response.data;
  } catch (error) {
    const actualError = error.data.error;
    throw {
      statusCode: actualError.statusCode || 500,
      message:
        actualError.cause ||
        "Failed to send verification email. Please try again.",
    };
  }
}

/**
 * Initiate password reset process
 * Backend sends an email to the user with password reset instructions
 * @param email - User's email
 * @returns response body
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function requestPasswordReset(email: string) {
  try {
    const response = await httpClient.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  } catch (error) {
    const actualError = error.data.error;
    throw {
      statusCode: actualError.statusCode || 500,
      message:
        actualError.cause ||
        "Failed to send password reset email. Please try again.",
    };
  }
}

/**
 * Sends password reset request to backend
 * @param token - Reset token
 * @param newPassword - New password
 * @returns response body
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function resetPassword(token: string, newPassword: string) {
  try {
    const response = await httpClient.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  } catch (error) {
    const actualError = error.data.error;
    throw {
      statusCode: actualError.statusCode || 500,
      message:
        actualError.cause || "Failed to reset password. Please try again.",
    };
  }
}

/**
 * Handles sign-in with Google One Tap
 * @param credentialResponse - Response from Google One Tap
 * @param onSuccess - Callback function to execute on successful login
 * @param onError - Callback function to execute on login failure
 */
export async function signInWithOneTap(
  credentialResponse: CredentialResponse,
  onSuccess: () => void,
  onError: () => void
) {
  try {
    const response = await httpClient.get(
      `/auth/google/onetap?token=${credentialResponse.credential}`
    );
    if (response.status === 200) {
      return onSuccess();
    }
    return onError();
  } catch (error) {
    const actualError = error.data.error;
    throw {
      statusCode: actualError.statusCode || 500,
      message: actualError.cause || "Signup failed. Please try again.",
    };
  }
}

/**
 * @returns true if client is authenticated, false if not authenticated
 */
export async function isClientAuthenticated() {
  try {
    const response = await httpClient.get("/auth/check");
    return response.data.data.loggedIn;
  } catch (error) {
    // Return false for any authentication check failure (401, network issues, etc.)
    return false;
  }
}

// Compatibility exports with old function names
