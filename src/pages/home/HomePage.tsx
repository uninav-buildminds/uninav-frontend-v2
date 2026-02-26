import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen01Icon,
  UserMultipleIcon,
  Mp301Icon,
  Logout01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { getRecentMaterials } from "@/api/materials.api";
import { useAuth } from "@/hooks/useAuth";
import { getLastTool, type LastTool } from "@/utils/sessionTracker";

const TOOLS = [
  {
    name: "Materials",
    description: "Browse, download, and upload course materials shared by your peers.",
    href: "/dashboard",
    icon: BookOpen01Icon,
    label: "Open Materials",
  },
  {
    name: "Clubs",
    description: "Discover student clubs and communities across your campus.",
    href: "/clubs",
    icon: UserMultipleIcon,
    label: "Explore Clubs",
  },
  {
    name: "Guides",
    description: "Step-by-step academic guides to help you get the most out of UniNav.",
    href: "/guides",
    icon: Mp301Icon,
    label: "Browse Guides",
  },
];

const TOOL_ICON_MAP: Record<string, typeof BookOpen01Icon> = {
  Materials: BookOpen01Icon,
  Clubs: UserMultipleIcon,
  Guides: Mp301Icon,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const HomePage: React.FC = () => {
  const { user, logOut } = useAuth();
  const [lastTool, setLastTool] = useState<LastTool | null>(null);

  const { data: recentData } = useQuery({
    queryKey: ["recent-materials-home"],
    queryFn: getRecentMaterials,
  });

  useEffect(() => {
    setLastTool(getLastTool());
  }, []);

  const recentMaterials = recentData?.items?.slice(0, 3) ?? [];
  const firstName = user?.firstName || "there";
  const lastToolIcon = lastTool ? (TOOL_ICON_MAP[lastTool.name] ?? BookOpen01Icon) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top bar ── */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <img src="/assets/logo.svg" alt="UniNav" className="h-7 w-7" />
          <span className="font-semibold text-brand text-base tracking-tight">
            UniNav
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {user && (
            <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-white/50 flex-shrink-0">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  className="h-full w-full object-cover"
                  alt={user.firstName}
                />
              ) : (
                <div className="h-full w-full bg-brand text-white flex items-center justify-center text-xs font-semibold">
                  {`${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()}
                </div>
              )}
            </div>
          )}
          <button
            onClick={logOut}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
          >
            <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.5} size={15} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* ── Gradient hero ── */}
      <section className="relative overflow-visible">
        <div className="bg-gradient-to-br from-[theme(colors.dashboard.gradientFrom)] to-[theme(colors.dashboard.gradientTo)]">
          <div className="px-4 sm:px-6 pt-12 pb-10 sm:pt-14 sm:pb-12 text-center max-w-3xl mx-auto">
            <motion.p
              className="text-xs font-semibold uppercase tracking-widest text-brand/70 mb-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              Welcome back
            </motion.p>
            <motion.h1
              className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            >
              {firstName}, what are you working on today?
            </motion.h1>
            <motion.p
              className="mt-2 text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              All your campus tools, in one place.
            </motion.p>

            {/* ── Continue CTA (session-aware) ── */}
            {lastTool && (
              <motion.div
                className="mt-6 flex justify-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
              >
                <Link
                  to={lastTool.href}
                  className="group inline-flex items-center gap-2.5 bg-white border border-brand/20 hover:border-brand/50 shadow-sm hover:shadow-md px-5 py-2.5 rounded-full transition-all duration-200"
                >
                  <div className="h-6 w-6 rounded-lg bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                    <HugeiconsIcon
                      icon={lastToolIcon!}
                      strokeWidth={1.5}
                      size={13}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Continue{" "}
                    <span className="text-brand">{lastTool.label}</span>
                  </span>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    strokeWidth={2}
                    size={14}
                    className="text-brand group-hover:translate-x-0.5 transition-transform duration-200"
                  />
                </Link>
              </motion.div>
            )}
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-10 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* ── Content ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12 pb-20">

        {/* Tool cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {TOOLS.map((tool) => (
            <motion.div key={tool.name} variants={itemVariants} className="h-full">
              <Link
                to={tool.href}
                className="group relative flex flex-col rounded-2xl border bg-white p-4 sm:p-5 transition-all duration-200 hover:shadow-md hover:border-brand/30 h-full"
              >
                {/* Icon — matches MetricCard style */}
                <div className="mb-4 h-10 w-10 rounded-xl border border-brand text-brand flex items-center justify-center flex-shrink-0">
                  <HugeiconsIcon icon={tool.icon} strokeWidth={1.5} size={20} />
                </div>

                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  {tool.name}
                </p>
                <h2 className="text-base font-semibold text-foreground leading-snug mb-2">
                  {tool.label}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {tool.description}
                </p>

                {/* CTA row */}
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand group-hover:gap-2 transition-all duration-200">
                  <span>Go to {tool.name}</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} size={15} />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent materials */}
        {recentMaterials.length > 0 && (
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">
                Recent materials
              </h2>
              <Link
                to="/dashboard/recent"
                className="text-xs text-brand hover:underline"
              >
                View all
              </Link>
            </div>
            <ul className="space-y-2">
              {recentMaterials.map((material) => (
                <li key={material.id}>
                  <Link
                    to={`/dashboard/material/${material.slug}`}
                    className="group flex items-center gap-3 rounded-2xl border bg-white p-3 sm:p-4 transition-all duration-200 hover:shadow-md hover:border-brand/30"
                  >
                    <div className="h-9 w-9 rounded-xl border border-brand text-brand flex items-center justify-center flex-shrink-0">
                      <HugeiconsIcon
                        icon={BookOpen01Icon}
                        strokeWidth={1.5}
                        size={17}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground group-hover:text-brand transition-colors truncate flex-1">
                      {material.label}
                    </span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      strokeWidth={1.5}
                      size={15}
                      className="text-muted-foreground group-hover:text-brand transition-colors flex-shrink-0"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
