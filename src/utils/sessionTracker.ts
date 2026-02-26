const SESSION_KEY = "uninav_last_tool";

export interface LastTool {
  name: string;   // "Materials" | "Clubs" | "Guides"
  href: string;   // last exact path the user was on (e.g. /dashboard/material/slug)
  label: string;  // display label e.g. "Materials"
}

/** Map route prefixes to tool metadata */
const TOOL_MAP: Array<{ prefix: string; name: string; label: string }> = [
  { prefix: "/dashboard", name: "Materials", label: "Materials" },
  { prefix: "/clubs",     name: "Clubs",     label: "Clubs"     },
  { prefix: "/guides",    name: "Guides",    label: "Guides"    },
];

/** Paths that should not be recorded (home itself, auth, management, public views) */
const IGNORED_PREFIXES = ["/home", "/auth", "/management", "/view", "/"];

export function resolveToolForPath(pathname: string): typeof TOOL_MAP[0] | null {
  if (IGNORED_PREFIXES.some((p) => p !== "/" ? pathname.startsWith(p) : pathname === "/")) {
    return null;
  }
  return TOOL_MAP.find((t) => pathname.startsWith(t.prefix)) ?? null;
}

export function saveLastTool(pathname: string, search: string): void {
  const tool = resolveToolForPath(pathname);
  if (!tool) return;
  const entry: LastTool = {
    name: tool.name,
    label: tool.label,
    href: pathname + search,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(entry));
}

export function getLastTool(): LastTool | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as LastTool) : null;
  } catch {
    return null;
  }
}
