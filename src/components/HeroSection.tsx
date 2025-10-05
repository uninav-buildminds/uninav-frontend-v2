import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/shared/SearchBar";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { searchMaterials, getPopularMaterials } from "@/api/materials.api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Navbar: React.FC = () => <Header />;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
  },
};

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { loggedIn } = useAuth();
  const [suggestions, setSuggestions] = useState<
    {
      id: string;
      title: string;
      type: "course" | "material";
      subtitle?: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [popular, setPopular] = useState<any[]>([]);

  const handleInputChange = async (q: string) => {
    if (!q) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await searchMaterials({
        query: q,
        limit: 5,
        page: 1,
        ignorePreference: true,
      });
      const items = res.data.items || [];
      setSuggestions(
        items.map((m: any) => ({
          id: m.id,
          title: m.label || m.targetCourse?.courseName || "Material",
          type: "material" as const,
          subtitle: m.targetCourse?.courseCode,
        }))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSelect = (titleOrId: string) => {
    // If user is not logged in, redirect to signin
    if (!loggedIn) {
      navigate("/auth/signin");
      return;
    }
    // Fallback: go to dashboard search page in the future; for now do nothing
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await getPopularMaterials(10);
        setPopular(res.data as any);
      } catch (e) {}
    })();
  }, []);

  return (
    <>
      <section
        className="relative overflow-hidden"
        id="home"
        style={{
          backgroundImage: "url(/assets/hero-bg.svg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          {/* Floating navbar */}
          <div className="pt-6 md:pt-10">
            <div className="mx-auto max-w-5xl">
              <Navbar />
            </div>
          </div>

          {/* Hero copy */}
          <motion.div
            className="relative z-10 mx-auto max-w-4xl text-center py-20 md:py-28"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              className="font-semibold tracking-tight text-xl sm:text-3xl md:text-5xl lg:text-6xl leading-tight text-foreground px-2 sm:px-0"
              variants={itemVariants}
            >
              <div className="whitespace-nowrap">
                No More Scrambling for Notes – Get
              </div>
              <div className="whitespace-nowrap">
                Everything You Need in One Place
              </div>
            </motion.h1>
            <motion.p
              className="mt-4 text-base sm:text-lg text-muted-foreground"
              variants={itemVariants}
            >
              Access a vast library of study resources, connect with peers, and
              achieve your academic goals.
            </motion.p>

            {/* Search bar */}
            <motion.div
              className="mt-8 flex justify-center"
              variants={itemVariants}
            >
              <SearchBar
                placeholder="Search courses..."
                className="w-full max-w-xl"
                onSearch={handleSearchSelect}
                onInputChange={handleInputChange}
                suggestions={suggestions}
                isLoading={isLoading}
              />
            </motion.div>

            {popular.length > 0 && (
              <motion.div className="mt-8" variants={itemVariants}>
                <div className="text-sm text-muted-foreground mb-3">
                  Trending now
                </div>

                {/* Horizontal auto-scroll list */}
                <div className="relative overflow-hidden">
                  <motion.div
                    className="flex gap-4 px-1"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                      duration: 30,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{ willChange: "transform" }}
                  >
                    {[...popular, ...popular].map((m: any, idx: number) => (
                      <button
                        key={`${m.id}-${idx}`}
                        onClick={() => {
                          if (!loggedIn) return navigate("/auth/signin");
                          navigate(`/dashboard/material/${m.id}`);
                        }}
                        className="group relative w-56 h-32 shrink-0 rounded-2xl border border-gray-200/70 bg-white/60 backdrop-blur-sm overflow-hidden text-left shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        {/* Background preview */}
                        {m.previewUrl && (
                          <div
                            className="absolute inset-0 bg-center bg-cover opacity-25 group-hover:opacity-30 transition-opacity"
                            style={{ backgroundImage: `url(${m.previewUrl})` }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/60" />

                        <div className="relative z-10 h-full flex flex-col justify-between p-3">
                          <div>
                            <div className="text-sm font-semibold text-foreground line-clamp-2">
                              {m.label || "Material"}
                            </div>
                            <div className="mt-1 flex gap-1 flex-wrap">
                              {(m.tags?.slice?.(0, 2) || []).map(
                                (t: string) => (
                                  <span
                                    key={t}
                                    className="text-[10px] px-2 py-0.5 rounded-full bg-brand/10 text-brand"
                                  >
                                    {t}
                                  </span>
                                )
                              )}
                              {m.targetCourse?.courseCode && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                  {m.targetCourse.courseCode}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="">{m.views ?? 0} views</span>
                            <span className="inline-flex items-center gap-1 text-brand">
                              View
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="-mr-0.5"
                              >
                                <path
                                  d="M5 12h14M13 5l7 7-7 7"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Dashboard preview image*/}
        <motion.div
          className="relative pb-16 md:pb-24"
          variants={imageVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <img
            src="/assets/demo-dash.svg"
            alt="Dashboard preview"
            className="block w-[min(1200px,96%)] mx-auto"
          />
        </motion.div>

        {/* Decorative brand-colored halo */}
        <div
          aria-hidden
          className="pointer-events-none absolute -z-0 inset-x-0 top-0 h-48 bg-gradient-to-b from-brand-light to-transparent"
        />
      </section>
    </>
  );
};

export default HeroSection;
