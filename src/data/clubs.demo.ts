/**
 * Demo data for Clubs page. Replace with API when backend is ready.
 */
export interface DemoClub {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Single image for card; use imageUrls for detail carousel */
  imageUrl?: string;
  /** Up to 3 images for detail carousel. Falls back to imageUrl or placeholder */
  imageUrls?: string[];
  externalLink: string;
  tags: string[];
  department?: string;
  /** Optional: e.g. "50+ members" for display */
  meta?: string;
}

export const DEMO_CLUBS: DemoClub[] = [
  {
    id: "1",
    slug: "coding-club",
    name: "Coding Club",
    description: "Learn to code, build projects, and compete in hackathons. All levels welcome.",
    externalLink: "https://example.com/coding-club",
    tags: ["Tech", "Programming"],
    department: "Computer Science",
    meta: "50+ members",
    imageUrls: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  },
  {
    id: "2",
    slug: "debate-society",
    name: "Debate Society",
    description: "Develop public speaking and critical thinking. Weekly sessions and inter-university competitions.",
    externalLink: "https://example.com/debate",
    tags: ["Debate", "Public Speaking"],
    department: "General",
    meta: "30+ members",
    imageUrls: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  },
  {
    id: "3",
    slug: "photo-club",
    name: "Photo Club",
    description: "Photography walks, workshops, and exhibitions. Bring any camera.",
    externalLink: "https://example.com/photo",
    tags: ["Photography", "Creative"],
    meta: "25+ members",
    imageUrls: ["/placeholder.svg", "/placeholder.svg"],
  },
  {
    id: "4",
    slug: "ai-club",
    name: "AI & ML Club",
    description: "Explore machine learning and AI. Study groups, Kaggle, and guest talks.",
    externalLink: "https://example.com/ai-club",
    tags: ["Tech", "AI", "ML"],
    department: "Computer Science",
    meta: "40+ members",
    imageUrls: ["/placeholder.svg"],
  },
  {
    id: "5",
    slug: "writers-guild",
    name: "Writers' Guild",
    description: "Fiction, poetry, and non-fiction. Share work and get feedback in a supportive space.",
    externalLink: "https://example.com/writers",
    tags: ["Writing", "Creative"],
    meta: "20+ members",
    imageUrls: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  },
  {
    id: "6",
    slug: "robotics",
    name: "Robotics Club",
    description: "Design and build robots. Compete in national and regional robotics challenges.",
    externalLink: "https://example.com/robotics",
    tags: ["Tech", "Engineering"],
    department: "Engineering",
    meta: "35+ members",
    imageUrls: ["/placeholder.svg", "/placeholder.svg"],
  },
];
