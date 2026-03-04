/**
 * Cache bust version — increment this to trigger the SW kill switch.
 *
 * HOW TO ACTIVATE THE KILL SWITCH:
 *   1. Bump this number (e.g. 1 → 2)
 *   2. Deploy normally
 *
 * What happens automatically:
 *   - On next page load the app sends { type: "CLEAR_CACHE" } to the active SW
 *   - The SW deletes ALL runtime caches
 *   - The page reloads once, fresh
 *   - The version is stored in localStorage so the message is only sent once
 *     per version bump — not on every page load
 *
 * When to bump:
 *   - A bad cache has been shipped (wrong data, stale auth responses, etc.)
 *   - You've made breaking changes to a cached API response shape
 *   - You want to force all users onto fresh caches after a major release
 */
export const CACHE_BUST_VERSION = 1;
