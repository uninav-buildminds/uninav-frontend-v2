import { API_BASE_URL } from "@/lib/utils";
import axios from "axios";

export const httpClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

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
