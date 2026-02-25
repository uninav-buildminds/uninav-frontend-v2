import { ResponseStatus, type PaginatedResponse, type Response } from "@/lib/types/response.types";
import {
  Club,
  type ClubAnalytics,
  type ClubFlag,
  type ClubRequest,
  ClubStatusEnum,
  ClubTargetingEnum,
  type CreateClubDto,
  type GetClubsParams,
  type UpdateClubDto,
} from "@/lib/types/club.types";
import type { Department } from "@/lib/types/department.types";

const nowIso = () => new Date().toISOString();
const isoDaysAgo = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

function ok<T>(data: T, message = "OK"): Response<T> {
  return { status: ResponseStatus.SUCCESS, message, data };
}

function err(message: string, statusCode = 404): Response<never> {
  return {
    status: ResponseStatus.ERROR,
    message,
    error: {
      cause: null,
      name: "MockError",
      path: "clubs.mock",
      statusCode,
    },
  };
}

function paginate<T>(items: T[], page = 1, limit = 12) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));
  const start = (safePage - 1) * safeLimit;
  const data = items.slice(start, start + safeLimit);
  return {
    data,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalPages,
      totalItems,
      hasMore: safePage < totalPages,
      hasPrev: safePage > 1,
    },
  };
}

// --- Mock seed data -----------------------------------------------------

const departments: Department[] = [
  {
    id: "dept-cs",
    name: "Computer Science",
    description: "Software, systems, and AI",
    facultyId: "faculty-sci",
  },
  {
    id: "dept-biz",
    name: "Business",
    description: "Entrepreneurship, finance, and management",
    facultyId: "faculty-biz",
  },
  {
    id: "dept-eng",
    name: "Engineering",
    description: "Mechanical, electrical, civil",
    facultyId: "faculty-eng",
  },
  {
    id: "dept-art",
    name: "Arts & Design",
    description: "Creative arts and design",
    facultyId: "faculty-art",
  },
];

type MockPerson = {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  department?: Department;
};

const people: Record<string, MockPerson> = {
  "u-1": {
    id: "u-1",
    firstName: "Amina",
    lastName: "Said",
    department: departments[0],
  },
  "u-2": {
    id: "u-2",
    firstName: "Daniel",
    lastName: "Kim",
    department: departments[2],
  },
  "u-3": {
    id: "u-3",
    firstName: "Leila",
    lastName: "Okafor",
    department: departments[1],
  },
  "u-4": {
    id: "u-4",
    firstName: "Omar",
    lastName: "Hassan",
    department: departments[3],
  },
};

const clubId = (n: number) => `club-${n}`;

let clubs: Club[] = [
  {
    id: clubId(1),
    name: "AI Builders Society",
    description:
      "Weekly build sessions, ML paper reads, and hack nights. Beginner-friendly with project mentorship.",
    imageUrl: "/assets/logo.svg",
    bannerUrl: "/assets/solution/first.png",
    externalLink: "https://example.com/ai-builders",
    redirectUrl: `https://uninav.live/clubs/${clubId(1)}`,
    tags: ["workshops", "projects", "mentorship"],
    interests: ["AI", "Hackathons", "Programming"],
    targeting: ClubTargetingEnum.PUBLIC,
    targetDepartmentIds: [],
    status: ClubStatusEnum.LIVE,
    organizerId: people["u-1"].id,
    organizer: {
      id: people["u-1"].id,
      firstName: people["u-1"].firstName,
      lastName: people["u-1"].lastName,
      profilePicture: people["u-1"].profilePicture,
      department: people["u-1"].department,
    },
    clickCount: 128,
    createdAt: isoDaysAgo(18),
    updatedAt: isoDaysAgo(2),
  },
  {
    id: clubId(2),
    name: "UniNav Entrepreneurs",
    description:
      "Pitch practice, startup cofounder matching, and monthly founder talks. Bring an idea or just curiosity.",
    imageUrl: "/assets/cta.png",
    bannerUrl: "/assets/solution/second.png",
    externalLink: "https://example.com/entrepreneurs",
    redirectUrl: `https://uninav.live/clubs/${clubId(2)}`,
    tags: ["startups", "pitch"],
    interests: ["Entrepreneurship", "Business", "Networking"],
    targeting: ClubTargetingEnum.SPECIFIC,
    targetDepartmentIds: ["dept-biz", "dept-cs"],
    targetDepartments: departments.filter((d) => ["dept-biz", "dept-cs"].includes(d.id)),
    status: ClubStatusEnum.LIVE,
    organizerId: people["u-3"].id,
    organizer: {
      id: people["u-3"].id,
      firstName: people["u-3"].firstName,
      lastName: people["u-3"].lastName,
      profilePicture: people["u-3"].profilePicture,
      department: people["u-3"].department,
    },
    clickCount: 64,
    createdAt: isoDaysAgo(40),
    updatedAt: isoDaysAgo(10),
  },
  {
    id: clubId(3),
    name: "Creative Coders",
    description:
      "A cross-discipline club exploring generative art, creative tooling, and interactive design. Monthly showcases.",
    bannerUrl: "/assets/solution/third.png",
    externalLink: "https://example.com/creative-coders",
    redirectUrl: `https://uninav.live/clubs/${clubId(3)}`,
    tags: ["generative", "design"],
    interests: ["Design", "Programming", "Photography"],
    targeting: ClubTargetingEnum.EXCLUDE,
    targetDepartmentIds: ["dept-biz"],
    targetDepartments: departments.filter((d) => d.id === "dept-biz"),
    status: ClubStatusEnum.FLAGGED,
    organizerId: people["u-4"].id,
    organizer: {
      id: people["u-4"].id,
      firstName: people["u-4"].firstName,
      lastName: people["u-4"].lastName,
      profilePicture: people["u-4"].profilePicture,
      department: people["u-4"].department,
    },
    clickCount: 22,
    createdAt: isoDaysAgo(6),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: clubId(4),
    name: "Robotics & Makers",
    description:
      "Build robots, learn electronics, and ship real hardware projects. Weekly lab meetups + competition team.",
    bannerUrl: "/assets/demo-dash.png",
    externalLink: "https://example.com/robotics",
    redirectUrl: `https://uninav.live/clubs/${clubId(4)}`,
    tags: ["hardware", "electronics"],
    interests: ["Engineering", "Hackathons"],
    targeting: ClubTargetingEnum.PUBLIC,
    targetDepartmentIds: [],
    status: ClubStatusEnum.HIDDEN,
    organizerId: people["u-2"].id,
    organizer: {
      id: people["u-2"].id,
      firstName: people["u-2"].firstName,
      lastName: people["u-2"].lastName,
      profilePicture: people["u-2"].profilePicture,
      department: people["u-2"].department,
    },
    clickCount: 9,
    createdAt: isoDaysAgo(3),
    updatedAt: isoDaysAgo(3),
  },
];

let flags: ClubFlag[] = [
  {
    id: "flag-1",
    clubId: clubId(3),
    club: clubs.find((c) => c.id === clubId(3)),
    reason: "Spam / misleading external link",
    reporterId: people["u-2"].id,
    reporter: {
      id: people["u-2"].id,
      firstName: people["u-2"].firstName,
      lastName: people["u-2"].lastName,
    },
    status: "pending",
    createdAt: isoDaysAgo(1),
  },
];

let requests: ClubRequest[] = [
  {
    id: "req-1",
    name: "Chess Club",
    interest: "Games",
    message: "Would love a weekly tournament + casual games.",
    requesterId: people["u-1"].id,
    requester: {
      id: people["u-1"].id,
      firstName: people["u-1"].firstName,
      lastName: people["u-1"].lastName,
      department: people["u-1"].department,
    },
    status: "pending",
    createdAt: isoDaysAgo(5),
  },
  {
    id: "req-2",
    name: "Product Management Circle",
    interest: "Business",
    message: "PM case studies + guest speakers.",
    requesterId: people["u-4"].id,
    requester: {
      id: people["u-4"].id,
      firstName: people["u-4"].firstName,
      lastName: people["u-4"].lastName,
      department: people["u-4"].department,
    },
    status: "fulfilled",
    createdAt: isoDaysAgo(20),
  },
];

const clickLogsByClubId = new Map<string, { departmentId?: string; timestamp: string }[]>();

function pushClick(clubId: string, departmentId?: string) {
  const list = clickLogsByClubId.get(clubId) ?? [];
  list.push({ departmentId, timestamp: nowIso() });
  clickLogsByClubId.set(clubId, list);
}

// Seed some trend/click data
for (let i = 0; i < 30; i++) {
  pushClick(clubId(1), i % 2 === 0 ? "dept-cs" : "dept-eng");
}
for (let i = 0; i < 12; i++) {
  pushClick(clubId(2), "dept-biz");
}
for (let i = 0; i < 6; i++) {
  pushClick(clubId(3), "dept-art");
}

function computeAnalytics(clubId: string): ClubAnalytics {
  const logs = clickLogsByClubId.get(clubId) ?? [];

  const countsByDept = new Map<string, number>();
  for (const l of logs) {
    const deptId = l.departmentId ?? "unknown";
    countsByDept.set(deptId, (countsByDept.get(deptId) ?? 0) + 1);
  }

  const clicksByDept = Array.from(countsByDept.entries())
    .filter(([deptId]) => deptId !== "unknown")
    .map(([departmentId, clicks]) => {
      const departmentName =
        departments.find((d) => d.id === departmentId)?.name ?? "Unknown";
      return { departmentId, departmentName, clicks };
    });

  const days = 14;
  const clickTrend: { date: string; clicks: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = isoDaysAgo(i).slice(0, 10);
    const clicks = ((clubId.length + i) * 7) % 11; // deterministic-ish
    clickTrend.push({ date, clicks });
  }

  return {
    totalClicks: (clubs.find((c) => c.id === clubId)?.clickCount ?? 0) + logs.length,
    clicksByDept,
    clickTrend,
  };
}

function clubFromDto(id: string, dto: CreateClubDto, organizerId: string): Club {
  const createdAt = nowIso();
  const organizer = people[organizerId] ?? people["u-1"];
  const targetDepartments = dto.targetDepartmentIds.length
    ? departments.filter((d) => dto.targetDepartmentIds.includes(d.id))
    : undefined;

  return {
    id,
    name: dto.name,
    description: dto.description,
    imageUrl: "/assets/logo.svg",
    bannerUrl: "/assets/hero-bg.svg",
    externalLink: dto.externalLink,
    redirectUrl: `https://uninav.live/clubs/${id}`,
    tags: dto.tags,
    interests: dto.interests,
    targeting: dto.targeting,
    targetDepartmentIds: dto.targetDepartmentIds,
    targetDepartments,
    status: ClubStatusEnum.LIVE,
    organizerId,
    organizer: {
      id: organizer.id,
      firstName: organizer.firstName,
      lastName: organizer.lastName,
      profilePicture: organizer.profilePicture,
      department: organizer.department,
    },
    clickCount: 0,
    createdAt,
    updatedAt: createdAt,
  };
}

// --- Mock API functions -------------------------------------------------

export async function mockGetClubs(
  params: GetClubsParams = {},
): Promise<PaginatedResponse<Club>> {
  const { search, interest, organizerId, status } = params;

  let filtered = [...clubs];

  if (typeof status !== "undefined") {
    filtered = filtered.filter((c) => c.status === status);
  }

  if (organizerId) {
    filtered = filtered.filter((c) => c.organizerId === organizerId);
    // Demo-friendly: if the signed-in user doesn't match the seeded organizer IDs,
    // still show clubs so the page isn't empty in mock mode.
    if (filtered.length === 0) filtered = [...clubs];
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  if (interest) {
    const i = interest.toLowerCase();
    filtered = filtered.filter((c) =>
      c.interests.some((x) => x.toLowerCase() === i),
    );
  }

  // stable ordering
  filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const { data, pagination } = paginate(filtered, page, limit);

  return ok({ data, pagination }, "Mock clubs") as PaginatedResponse<Club>;
}

export async function mockGetClubById(id: string): Promise<Response<Club>> {
  const club = clubs.find((c) => c.id === id);
  if (!club) return err("Club not found", 404);
  return ok(club, "Mock club");
}

export async function mockCreateClub(dto: CreateClubDto): Promise<Response<Club>> {
  const id = `club-${Math.floor(Math.random() * 100000)}`;
  const newClub = clubFromDto(id, dto, people["u-1"].id);
  clubs = [newClub, ...clubs];
  return ok(newClub, "Mock created");
}

export async function mockUpdateClub(
  id: string,
  dto: UpdateClubDto,
): Promise<Response<Club>> {
  const existing = clubs.find((c) => c.id === id);
  if (!existing) return err("Club not found", 404);

  const updated: Club = {
    ...existing,
    ...dto,
    tags: dto.tags ?? existing.tags,
    interests: dto.interests ?? existing.interests,
    targeting: dto.targeting ?? existing.targeting,
    targetDepartmentIds: dto.targetDepartmentIds ?? existing.targetDepartmentIds,
    targetDepartments:
      dto.targetDepartmentIds
        ? departments.filter((d) => dto.targetDepartmentIds!.includes(d.id))
        : existing.targetDepartments,
    updatedAt: nowIso(),
  };

  clubs = clubs.map((c) => (c.id === id ? updated : c));
  return ok(updated, "Mock updated");
}

export async function mockDeleteClub(id: string): Promise<Response<void>> {
  clubs = clubs.filter((c) => c.id !== id);
  flags = flags.filter((f) => f.clubId !== id);
  return ok(undefined, "Mock deleted");
}

export async function mockTrackClubClick(
  id: string,
): Promise<Response<{ externalLink: string }>> {
  const club = clubs.find((c) => c.id === id);
  if (!club) return err("Club not found", 404);

  pushClick(id, club.organizer?.department?.id);

  clubs = clubs.map((c) =>
    c.id === id ? { ...c, clickCount: (c.clickCount ?? 0) + 1 } : c,
  );

  return ok({ externalLink: club.externalLink }, "Mock click tracked");
}

export async function mockGetClubAnalytics(
  id: string,
): Promise<Response<ClubAnalytics>> {
  const club = clubs.find((c) => c.id === id);
  if (!club) return err("Club not found", 404);
  return ok(computeAnalytics(id), "Mock analytics");
}

export async function mockExportClubAnalytics(id: string): Promise<Blob> {
  const analytics = computeAnalytics(id);

  const rows = [
    ["department", "clicks"].join(","),
    ...analytics.clicksByDept.map((d) =>
      [JSON.stringify(d.departmentName), String(d.clicks)].join(","),
    ),
  ];

  const csv = rows.join("\n");
  return new Blob([csv], { type: "text/csv;charset=utf-8" });
}

export async function mockFlagClub(
  clubId: string,
  reason: string,
): Promise<Response<ClubFlag>> {
  const club = clubs.find((c) => c.id === clubId);
  const newFlag: ClubFlag = {
    id: `flag-${Math.floor(Math.random() * 100000)}`,
    clubId,
    club: club,
    reason,
    reporterId: people["u-2"].id,
    reporter: {
      id: people["u-2"].id,
      firstName: people["u-2"].firstName,
      lastName: people["u-2"].lastName,
    },
    status: "pending",
    createdAt: nowIso(),
  };

  flags = [newFlag, ...flags];

  if (club) {
    clubs = clubs.map((c) =>
      c.id === clubId ? { ...c, status: ClubStatusEnum.FLAGGED } : c,
    );
  }

  return ok(newFlag, "Mock flagged");
}

export async function mockGetClubFlags(params: {
  page?: number;
  limit?: number;
  status?: string;
} = {}): Promise<PaginatedResponse<ClubFlag>> {
  let filtered = [...flags];
  if (params.status) filtered = filtered.filter((f) => f.status === params.status);

  const { data, pagination } = paginate(filtered, params.page ?? 1, params.limit ?? 20);
  return ok({ data, pagination }, "Mock flags") as PaginatedResponse<ClubFlag>;
}

export async function mockResolveFlag(
  flagId: string,
  action: "approve" | "hide" | "dismiss",
): Promise<Response<ClubFlag>> {
  const target = flags.find((f) => f.id === flagId);
  if (!target) return err("Flag not found", 404);

  let updatedStatus: ClubFlag["status"] = "reviewed";
  if (action === "dismiss") updatedStatus = "dismissed";

  const updated: ClubFlag = { ...target, status: updatedStatus };
  flags = flags.map((f) => (f.id === flagId ? updated : f));

  if (action === "hide") {
    clubs = clubs.map((c) =>
      c.id === target.clubId ? { ...c, status: ClubStatusEnum.HIDDEN } : c,
    );
  }

  if (action === "approve") {
    clubs = clubs.map((c) =>
      c.id === target.clubId ? { ...c, status: ClubStatusEnum.LIVE } : c,
    );
  }

  return ok(updated, "Mock resolved");
}

export async function mockUpdateClubStatus(
  id: string,
  status: ClubStatusEnum,
): Promise<Response<Club>> {
  const club = clubs.find((c) => c.id === id);
  if (!club) return err("Club not found", 404);

  const updated: Club = { ...club, status, updatedAt: nowIso() };
  clubs = clubs.map((c) => (c.id === id ? updated : c));
  return ok(updated, "Mock status updated");
}

export async function mockRequestClub(data: {
  name: string;
  interest: string;
  message?: string;
}): Promise<Response<ClubRequest>> {
  const req: ClubRequest = {
    id: `req-${Math.floor(Math.random() * 100000)}`,
    name: data.name,
    interest: data.interest,
    message: data.message,
    requesterId: people["u-4"].id,
    requester: {
      id: people["u-4"].id,
      firstName: people["u-4"].firstName,
      lastName: people["u-4"].lastName,
      department: people["u-4"].department,
    },
    status: "pending",
    createdAt: nowIso(),
  };

  requests = [req, ...requests];
  return ok(req, "Mock request submitted");
}

export async function mockGetClubRequests(params: {
  page?: number;
  limit?: number;
  status?: string;
} = {}): Promise<PaginatedResponse<ClubRequest>> {
  let filtered = [...requests];
  if (params.status) filtered = filtered.filter((r) => r.status === params.status);

  const { data, pagination } = paginate(filtered, params.page ?? 1, params.limit ?? 20);
  return ok({ data, pagination }, "Mock requests") as PaginatedResponse<ClubRequest>;
}

export async function mockUpdateClubRequest(
  requestId: string,
  status: "fulfilled" | "dismissed",
): Promise<Response<ClubRequest>> {
  const target = requests.find((r) => r.id === requestId);
  if (!target) return err("Request not found", 404);

  const updated: ClubRequest = { ...target, status };
  requests = requests.map((r) => (r.id === requestId ? updated : r));
  return ok(updated, "Mock request updated");
}
