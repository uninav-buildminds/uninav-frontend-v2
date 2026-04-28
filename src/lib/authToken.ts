const AUTH_TOKEN_COOKIE = "uninav_auth_token";

function buildCookie(value: string, maxAgeDays = 30) {
  const maxAgeSeconds = maxAgeDays * 24 * 60 * 60;
  return `${AUTH_TOKEN_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=None; Secure`;
}

export function setAuthToken(token: string) {
  if (!token) return;
  document.cookie = buildCookie(token);
}

export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${AUTH_TOKEN_COOKIE}=`));
  if (!match) return null;
  const value = match.split("=").slice(1).join("=");
  return value ? decodeURIComponent(value) : null;
}

export function clearAuthToken() {
  document.cookie = `${AUTH_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=None; Secure`;
}
