/**
 * Utility functions for managing authentication state in localStorage
 * Provides a simple way to persist login state for instant redirects
 */

const AUTH_STORAGE_KEY = 'uninav_auth_state';
const AUTH_TIMESTAMP_KEY = 'uninav_auth_timestamp';

/**
 * Sets the authentication state in localStorage
 * @param isLoggedIn - Whether the user is logged in
 */
export function setAuthState(isLoggedIn: boolean): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(isLoggedIn));
    localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    // Handle localStorage errors (e.g., quota exceeded, private browsing)
    console.warn('Failed to set auth state in localStorage:', error);
  }
}

/**
 * Gets the authentication state from localStorage
 * @returns true if user is logged in, false if not, null if not set
 */
export function getAuthState(): boolean | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored === null) return null;
    return JSON.parse(stored) as boolean;
  } catch (error) {
    // Handle localStorage errors or corrupted data
    console.warn('Failed to get auth state from localStorage:', error);
    return null;
  }
}

/**
 * Clears the authentication state from localStorage
 */
export function clearAuthState(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TIMESTAMP_KEY);
  } catch (error) {
    console.warn('Failed to clear auth state from localStorage:', error);
  }
}

/**
 * Checks if auth state exists in localStorage
 * @returns true if auth state is stored, false otherwise
 */
export function hasAuthState(): boolean {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) !== null;
  } catch (error) {
    return false;
  }
}

