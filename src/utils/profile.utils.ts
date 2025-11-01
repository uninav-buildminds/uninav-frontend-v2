import { UserProfile } from "@/lib/types/user.types";

/**
 * Checks if a user's profile is incomplete
 * A profile is considered incomplete if:
 * - Missing departmentId
 * - Missing level
 * - No enrolled courses (for personalized recommendations)
 */
export function isProfileIncomplete(user: UserProfile | undefined | null): boolean {
  if (!user) return true;

  // Check for required academic fields
  const missingDepartment = !user.departmentId;
  const missingLevel = !user.level || user.level === 0;
  const missingCourses = !user.courses || user.courses.length === 0;

  // Profile is incomplete if any critical field is missing
  return missingDepartment || missingLevel || missingCourses;
}

/**
 * Gets the completion percentage of the profile
 * Returns a number between 0 and 100
 */
export function getProfileCompletion(user: UserProfile | undefined | null): number {
  if (!user) return 0;

  let completedFields = 0;
  const totalFields = 3; // departmentId, level, courses

  if (user.departmentId) completedFields++;
  if (user.level && user.level > 0) completedFields++;
  if (user.courses && user.courses.length > 0) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
}

