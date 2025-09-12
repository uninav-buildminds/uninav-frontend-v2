import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This is the URL where the backend API is hosted
// It can be set in the .env file as VITE_API_BASE_URL
// If not set, it defaults to "http://localhost:3200"
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3200";
