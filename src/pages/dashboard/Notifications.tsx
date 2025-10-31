import React, { useEffect, useMemo, useState } from "react";
import Row from "@/components/notifications/Row";
import FiltersDropdown from "@/components/notifications/FiltersDropdown";
import type {
  NotificationItem,
  NotificationStatus,
} from "@/components/notifications/types";
import {
  ArrowLeft01Icon,
  Settings01Icon,
  FilterHorizontalIcon,
  Award02Icon,
  ArrowRight02Icon,
  Search01Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  Alert02Icon,
  Comment01Icon,
  NewsIcon,
} from "hugeicons-react";
import { useNavigate, Link } from "react-router-dom";
import {
  getNotifications,
  markAllNotificationsRead,
} from "@/api/notifications.api";

// types moved to components/notifications/types

const seedNotifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Upload Approved",
    description:
      "Your upload 'CSC 201 Lecture 5 Notes' has been approved by an admin. You've earned 10 points! awertfry hrtypoitupoiewuajp;iu3p;i po9up;oiuqj;4oiu;i uo;4irpoi3u4jtpoiR  ",
    timeLabel: "2 minutes ago",
    status: "unread",
    group: "Today",
    icon: <CheckmarkCircle02Icon className="text-emerald-500" size={22} />,
  },
  {
    id: "n2",
    title: "Points Milestone",
    description:
      "You've reached 50 points! You can now redeem them for an ad-free week.",
    timeLabel: "5 hours ago",
    status: "unread",
    group: "Today",
    icon: <Award02Icon className="text-brand" size={22} />,
  },
  {
    id: "n3",
    title: "Upload Rejected",
    description:
      "Your upload 'Math Homework 2' has been rejected due to formatting issues. Please revise and resubmit.",
    timeLabel: "4:00pm",
    status: "read",
    group: "Today",
    icon: <CancelCircleIcon className="text-rose-500" size={22} />,
  },
  {
    id: "n4",
    title: "New Comment",
    description:
      "User123 commented on your upload 'CSC 201 Lecture 5 Notes': 'Great notes! Very helpful.'",
    timeLabel: "1:32pm",
    status: "read",
    group: "2 days ago",
    icon: <Comment01Icon className="text-brand" size={22} />,
  },
  {
    id: "n5",
    title: "New Material in Saved Course",
    description: "New notes uploaded for CSC 101: 'Midterm Solutions'",
    timeLabel: "10:07am",
    status: "read",
    group: "2 days ago",
    icon: <NewsIcon className="text-brand" size={22} />,
  },
  {
    id: "n6",
    title: "System Alert",
    description: "Scheduled maintenance this Saturday from 2–4 AM.",
    timeLabel: "12:00am",
    status: "unread",
    group: "2 days ago",
    icon: <Alert02Icon className="text-amber-500" size={22} />,
  },
];

// Filters dropdown now uses shadcn Select in separate component

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | NotificationStatus>(
    "all"
  );
  const [filterTime, setFilterTime] = useState<"all" | "today" | "last2days">(
    "all"
  );
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!showFilter) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('[data-clickout-id="notif-filters"]') &&
        !target.closest("[data-open-filters]")
      ) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showFilter]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getNotifications({ page: 1, limit: 20 })
      .then((res) => {
        if (!mounted) return;
        const mapped: NotificationItem[] = res.items.map((it) => ({
          id: it.id,
          title: it.title,
          description: it.description,
          timeLabel: new Date(it.createdAt).toLocaleString(),
          status: it.status,
          group:
            new Date(it.createdAt).toDateString() === new Date().toDateString()
              ? "Today"
              : new Date(it.createdAt).toLocaleDateString(),
          icon:
            it.type === "material_approved" ? (
              <CheckmarkCircle02Icon className="text-emerald-500" size={22} />
            ) : it.type === "material_rejected" ? (
              <CancelCircleIcon className="text-rose-500" size={22} />
            ) : it.type === "points_awarded" ? (
              <Award02Icon className="text-brand" size={22} />
            ) : it.type === "email_verified" ? (
              <CheckmarkCircle02Icon className="text-brand" size={22} />
            ) : (
              <Alert02Icon className="text-amber-500" size={22} />
            ),
        }));
        setItems(mapped);
      })
      .finally(() => setIsLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const unreadCount = (items || []).filter((n) => n.status === "unread").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = items || [];
    const base = arr.filter((n) => {
      const statusOk =
        filterStatus === "all" ? true : n.status === filterStatus;
      const timeOk =
        filterTime === "all"
          ? true
          : filterTime === "today"
          ? n.group.toLowerCase() === "today"
          : n.group.toLowerCase().includes("2 days");
      return statusOk && timeOk;
    });
    if (!q) return base;
    return base.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q)
    );
  }, [items, query, filterStatus, filterTime]);

  const grouped = useMemo(() => {
    const map = new Map<string, NotificationItem[]>();
    for (const n of filtered) {
      if (!map.has(n.group)) map.set(n.group, []);
      map.get(n.group)!.push(n);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const markAllAsRead = () => {
    markAllNotificationsRead().then(() => {
      setItems((prev) =>
        prev ? prev.map((n) => ({ ...n, status: "read" })) : prev
      );
    });
  };

  return (
    <>
      {/* Header */}
      <div className="relative z-sticky">
        <div className="bg-gradient-to-br from-[theme(colors.dashboard.gradientFrom)] to-[theme(colors.dashboard.gradientTo)]">
          <div className="px-2 sm:px-4 pt-16 sm:pt-20 pb-4 sm:pb-6">
            <div className="max-w-6xl mx-auto flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="hidden sm:inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft01Icon size={18} />
                Back to Dashboard
              </button>

              {/* Mobile/Tablet Title inline with actions */}
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground sm:hidden ml-0">
                Notifications
              </h2>

              <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                <button
                  onClick={markAllAsRead}
                  className="px-3 sm:px-4 py-2 bg-brand text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-brand/90"
                >
                  Mark All as Read
                </button>
                <Link
                  to="/dashboard/settings"
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                  aria-label="Settings"
                >
                  <Settings01Icon size={18} />
                </Link>
              </div>
            </div>

            <div className="max-w-6xl mx-auto mt-4 sm:mt-6">
              <h2 className="hidden sm:block text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground">
                Notifications
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                You have {unreadCount} new notification
                {unreadCount === 1 ? "" : "s"}
              </p>

              {/* Search + Actions Row */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200 px-3 py-2">
                    <Search01Icon size={16} className="text-gray-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search"
                      className="w-full bg-transparent outline-none text-sm"
                    />
                    <button
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-brand text-white hover:bg-brand/90"
                      aria-label="Search"
                    >
                      <ArrowRight02Icon size={16} />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowFilter((s) => !s)}
                    className="px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 inline-flex items-center gap-2"
                    data-open-filters
                  >
                    <FilterHorizontalIcon size={18} />
                    <span className="hidden sm:inline">Filter</span>
                  </button>
                  {showFilter && (
                    <FiltersDropdown
                      status={filterStatus}
                      setStatus={setFilterStatus}
                      timeframe={filterTime}
                      setTimeframe={setFilterTime}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-10 bg-gradient-to-b from-transparent to-white" />
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-6 pb-28">
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
          {/* Header row */}
          <div className="hidden sm:grid grid-cols-12 px-4 py-3 text-xs font-medium text-gray-500 border-b border-gray-200">
            <div className="col-span-7">Notifications</div>
            <div className="col-span-3 pl-6">Time</div>
            <div className="col-span-2">Status</div>
          </div>

          {/* Groups */}
          {isLoading && (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse grid grid-cols-12 gap-2">
                  <div className="col-span-12 sm:col-span-7 flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-40 bg-gray-200 rounded" />
                      <div className="h-3 w-64 bg-gray-200 rounded" />
                    </div>
                  </div>
                  <div className="col-span-6 sm:col-span-3 h-3 bg-gray-200 rounded" />
                  <div className="col-span-6 sm:col-span-2 h-6 bg-gray-200 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {!isLoading &&
            grouped.map(([group, list]) => (
              <div
                key={group}
                className="border-b border-gray-200 last:border-0"
              >
                <div className="px-4 py-3 text-xs sm:text-sm font-medium text-gray-600 bg-gray-50">
                  {group}
                </div>
                {list.map((n) => (
                  <Row key={n.id} n={n} />
                ))}
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default Notifications;
