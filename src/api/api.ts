import { API_BASE_URL } from "@/lib/utils";
import axios from "axios";
import { getAuthToken } from "@/lib/authToken";

export const httpClient = axios.create({ baseURL: API_BASE_URL, withCredentials: false });

httpClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

// Redirect to sign-in on any explicit 401 — clears stale session assumptions
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      const current = window.location.pathname;
      if (!current.startsWith("/auth")) {
        window.location.href = `/auth/signin?redirect=${encodeURIComponent(current)}`;
      }
    }
    return Promise.reject(error);
  },
);
