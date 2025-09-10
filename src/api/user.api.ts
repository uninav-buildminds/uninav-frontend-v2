import { httpClient } from "./api";

/**
 * Fetches the profile of the currently authenticated user
 * @returns user profile data
 * @throws {statusCode, message} if response's status code is not in the 200s
 */
export async function getUserProfile() {
    const response = await httpClient.get("/user/profile");
    if (response.status === 200) {
        return response.data.data;
    }
    throw {
        statusCode: response.status,
        message:
            response.data?.message || "Fetching user profile failed. Please try again.",
    };
}