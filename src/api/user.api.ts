import { httpClient } from "./api";

/**
 * Fetches the profile of the currently authenticated user
 * @returns user profile data
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function getUserProfile() {
    const response = await httpClient("/user/profile");
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