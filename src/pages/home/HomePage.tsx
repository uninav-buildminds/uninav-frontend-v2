import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen01Icon,
  UserMultipleIcon,
  Mp301Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRecentMaterials } from "@/api/materials.api";
import { useAuth } from "@/hooks/useAuth";

const TOOLS = [
  {
    name: "Materials",
    description: "Browse and download course materials.",
    href: "/dashboard",
    icon: BookOpen01Icon,
  },
  {
    name: "Clubs",
    description: "Discover and join student clubs.",
    href: "/clubs",
    icon: UserMultipleIcon,
  },
  {
    name: "Guides",
    description: "Step-by-step academic guides.",
    href: "/guides",
    icon: Mp301Icon,
  },
];

const HomePage: React.FC = () => {
  const { user, logOut } = useAuth();
  const { data: recentData } = useQuery({
    queryKey: ["recent-materials-home"],
    queryFn: getRecentMaterials,
  });

  const recentMaterials = recentData?.items?.slice(0, 3) ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Simple top bar */}
      <header className="border-b px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/assets/logo.svg" alt="UniNav" className="h-7 w-7" />
          <span className="font-semibold text-brand text-base">UniNav</span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.firstName} {user.lastName}
            </span>
          )}
          <button
            onClick={logOut}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.5} size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        {/* Headline */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            All your campus tools in one place
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            UniNav brings materials, clubs, and guides together for your
            academic journey.
          </p>
        </div>

        {/* Tool cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {TOOLS.map((tool) => (
            <Card
              key={tool.name}
              className="border border-gray-200 hover:border-brand/40 hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/10 grid place-items-center text-brand">
                  <HugeiconsIcon
                    icon={tool.icon}
                    strokeWidth={1.5}
                    size={20}
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">{tool.name}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {tool.description}
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="mt-auto w-full bg-brand text-white hover:bg-brand/90"
                >
                  <Link to={tool.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent materials */}
        {recentMaterials.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-foreground mb-3">
              Continue where you left off
            </h2>
            <ul className="space-y-2">
              {recentMaterials.map((material) => (
                <li key={material.id}>
                  <Link
                    to={`/dashboard/material/${material.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-brand/30 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand/10 grid place-items-center text-brand flex-shrink-0">
                      <HugeiconsIcon
                        icon={BookOpen01Icon}
                        strokeWidth={1.5}
                        size={16}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground group-hover:text-brand transition-colors truncate">
                      {material.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
