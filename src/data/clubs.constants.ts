/** Pre-defined interest tags used for club targeting, onboarding, and filtering. */
export const CLUB_INTERESTS = [
  // Technology
  "Technology & Computing",
  "AI & Data Science",
  "Cybersecurity",
  "Game Development",
  // Business & Finance
  "Entrepreneurship",
  "Finance & Investing",
  "Marketing & PR",
  "Business Strategy",
  // Arts & Creativity
  "Music",
  "Film & Cinema",
  "Photography",
  "Art & Illustration",
  "Creative Writing",
  "Theatre & Drama",
  // Academics & Research
  "Science & Research",
  "Mathematics",
  "Engineering",
  "Law & Policy",
  "Medicine & Health Sciences",
  "History & Philosophy",
  // Social & Civic
  "Debate & Public Speaking",
  "Model UN & Diplomacy",
  "Social Impact & Advocacy",
  "Volunteering & Community Service",
  "Religion & Spirituality",
  // Lifestyle & Culture
  "Sports & Fitness",
  "Dance",
  "Fashion",
  "Cooking & Culinary",
  "Reading & Book Club",
  "Languages & Culture",
  "Travel & Exploration",
  // Health & Environment
  "Health & Wellness",
  "Environmental & Sustainability",
  "Mental Health",
  "Nutrition & Dietetics",
  // Media & Communication
  "Journalism & Media",
  "Networking & Professional Dev",
  "Podcasting & Broadcasting",
  "Content Creation",
] as const;

export type ClubInterest = (typeof CLUB_INTERESTS)[number];

/**
 * Maps old interest labels (as stored in the DB) to new ones.
 * Used by scripts/migrate-club-interests.ts to update existing records.
 */
export const CLUB_INTEREST_MIGRATION_MAP: Record<string, string> = {
  "Coding": "Technology & Computing",
  "Design": "Art & Illustration",
  "AI & Machine Learning": "AI & Data Science",
  "Robotics": "Engineering",
  "Data Science": "AI & Data Science",
  "Web Development": "Technology & Computing",
  "Mobile Development": "Technology & Computing",
  "Cloud Computing": "Technology & Computing",
  "Entrepreneurship": "Entrepreneurship",
  "Finance & Investing": "Finance & Investing",
  "Marketing": "Marketing & PR",
  "Business Strategy": "Business Strategy",
  "Music": "Music",
  "Film & Photography": "Film & Cinema",
  "Art & Illustration": "Art & Illustration",
  "Creative Writing": "Creative Writing",
  "Debate & Public Speaking": "Debate & Public Speaking",
  "Model UN": "Model UN & Diplomacy",
  "Sports & Fitness": "Sports & Fitness",
  "Dance": "Dance",
  "Volunteering": "Volunteering & Community Service",
  "Environmental & Sustainability": "Environmental & Sustainability",
  "Health & Wellness": "Health & Wellness",
  "Fashion": "Fashion",
  "Cooking & Culinary": "Cooking & Culinary",
  "Reading & Book Club": "Reading & Book Club",
  "Languages & Culture": "Languages & Culture",
  "Science & Research": "Science & Research",
  "Mathematics": "Mathematics",
  "Engineering": "Engineering",
  "Law & Policy": "Law & Policy",
  "Religion & Spirituality": "Religion & Spirituality",
  "Social Impact": "Social Impact & Advocacy",
  "Networking": "Networking & Professional Dev",
  // These had no old equivalent — new additions only
  // "Cybersecurity", "Game Development", "Photography", "Theatre & Drama",
  // "Medicine & Health Sciences", "History & Philosophy", "Travel & Exploration",
  // "Mental Health", "Nutrition & Dietetics", "Journalism & Media",
  // "Podcasting & Broadcasting", "Content Creation"
};
