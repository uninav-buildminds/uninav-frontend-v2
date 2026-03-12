import { UserProfile } from "@/lib/types/user.types";

/**
 * Returns the settings tab to navigate to based on the first missing profile field.
 * - "account" if interests are missing (interests live in AccountSection)
 * - "academic" if academic info (department/level) is missing
 * Returns null if the profile is complete.
 */
export function getFirstMissingProfileTab(
  user: UserProfile | undefined | null
): "account" | "academic" | null {
  if (!user) return "academic";

  const missingInterests = !user.interests || user.interests.length === 0;
  const missingAcademic =
    !user.departmentId ||
    !user.level ||
    user.level === 0 ||
    !user.courses ||
    user.courses.length === 0;

  if (missingInterests) return "account";
  if (missingAcademic) return "academic";
  return null;
}

/**
 * Checks if a user's profile is incomplete.
 * A profile is considered incomplete if any of the following are missing:
 * - departmentId
 * - level
 * - enrolled courses
 * - interests
 */
export function isProfileIncomplete(user: UserProfile | undefined | null): boolean {
  if (!user) return true;

  const missingDepartment = !user.departmentId;
  const missingLevel = !user.level || user.level === 0;
  const missingCourses = !user.courses || user.courses.length === 0;
  const missingInterests = !user.interests || user.interests.length === 0;

  return missingDepartment || missingLevel || missingCourses || missingInterests;
}

/**
 * Gets the completion percentage of the profile.
 * Returns a number between 0 and 100.
 */
export function getProfileCompletion(user: UserProfile | undefined | null): number {
  if (!user) return 0;

  let completedFields = 0;
  const totalFields = 4; // departmentId, level, courses, interests

  if (user.departmentId) completedFields++;
  if (user.level && user.level > 0) completedFields++;
  if (user.courses && user.courses.length > 0) completedFields++;
  if (user.interests && user.interests.length > 0) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
}

