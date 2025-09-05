import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:3200";
export const API_BASE_URL: string = "http://localhost:3200";
