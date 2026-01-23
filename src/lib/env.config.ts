/**
 * Environment configuration with validation
 * Centralized access to environment variables with type safety and validation
 */

// Environment configuration object
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3200",
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  GOOGLE_DRIVE_API_KEY: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY,
  GDRIVE_API_KEYS: import.meta.env.VITE_GDRIVE_API_KEYS,
  YOUTUBE_API_KEY: import.meta.env.VITE_YOUTUBE_API_KEY,
  NODE_ENV: import.meta.env.NODE_ENV || "development",
  MODE: import.meta.env.MODE || "development",
};

// Parse comma-separated API keys
export const GDRIVE_API_KEYS_ARRAY = ENV.GDRIVE_API_KEYS
  ? ENV.GDRIVE_API_KEYS.split(",")
      .map((key) => key.trim())
      .filter(Boolean)
  : [];

// Validation - loop through required variables
const requiredVars = {
  GOOGLE_CLIENT_ID: "Google OAuth will not work",
  GOOGLE_DRIVE_API_KEY: "Google Drive features will not work",
  GDRIVE_API_KEYS: "API key rotation will not work",
};

Object.entries(requiredVars).forEach(([key, message]) => {
  if (!ENV[key as keyof typeof ENV]) {
    console.warn(`⚠️ VITE_${key} is not set. ${message}.`);
  }
});
