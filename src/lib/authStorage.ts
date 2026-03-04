const REDIRECT_PATH_KEY = 'uninav_redirect_path';

/**
 * Sets the redirect path in localStorage
 * @param path - The path to redirect to after authentication
 */
export function setRedirectPath(path: string): void {
  try {
    // Only store if it's not an auth page or homepage
    if (path && !path.startsWith('/auth') && path !== '/') {
      localStorage.setItem(REDIRECT_PATH_KEY, path);
    }
  } catch (error) {
    console.warn('Failed to set redirect path in localStorage:', error);
  }
}

/**
 * Gets the redirect path from localStorage
 * @returns The stored redirect path or null if not set
 */
export function getRedirectPath(): string | null {
  try {
    return localStorage.getItem(REDIRECT_PATH_KEY);
  } catch (error) {
    console.warn('Failed to get redirect path from localStorage:', error);
    return null;
  }
}

/**
 * Clears the redirect path from localStorage
 */
export function clearRedirectPath(): void {
  try {
    localStorage.removeItem(REDIRECT_PATH_KEY);
  } catch (error) {
    console.warn('Failed to clear redirect path from localStorage:', error);
  }
}

/**
 * Converts a public route path to an authenticated route path
 * @param path - The public route path (e.g., /view/folder/slug or /view/material/slug)
 * @returns The authenticated route path (e.g., /dashboard/folder/slug or /dashboard/material/slug)
 */
export function convertPublicToAuthPath(path: string): string {
  // Convert /view/folder/:slug to /dashboard/folder/:slug
  const folderMatch = path.match(/^\/view\/folder\/(.+)$/);
  if (folderMatch) {
    return `/dashboard/folder/${folderMatch[1]}`;
  }

  // Convert /view/material/:slug to /dashboard/material/:slug
  const materialMatch = path.match(/^\/view\/material\/(.+)$/);
  if (materialMatch) {
    return `/dashboard/material/${materialMatch[1]}`;
  }

  // If it's already an authenticated path or doesn't match, return as-is
  return path;
}

