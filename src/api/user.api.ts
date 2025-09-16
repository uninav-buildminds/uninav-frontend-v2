import { httpClient } from "./api";
import { UserProfile } from "@/lib/types/user.types";

export interface FetchAllUsersResponse {
  data: UserProfile[];
  total: number;
}

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

export async function fetchAllUsers(
  page = 1,
  limit = 100,
  query = ""
): Promise<FetchAllUsersResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (query) params.append("query", query);
  const response = await httpClient.get(`/admin/users?${params.toString()}`);
  if (response.status === 200) {
    const { data, total } = response.data;
    return { data, total };
  }
  return { data: [], total: 0 };
}