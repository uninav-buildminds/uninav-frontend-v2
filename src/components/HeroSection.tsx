import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/shared/SearchBar";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { searchMaterials, getPopularMaterials } from "@/api/materials.api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
// import TrendingNow and its type; comment component import since it's currently disabled
// import TrendingNow, { TrendingItem } from "@/components/TrendingNow";
// import type { TrendingItem } from "@/components/TrendingNow";

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
  const [popular, setPopular] = useState<TrendingItem[]>([]);

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
        const items = Array.isArray(res?.data) ? res.data : [];
        const mapped: TrendingItem[] = items.map((m: any) => ({
          id: m.id,
          label: m.label,
          tags: Array.isArray(m.tags) ? m.tags : [],
          previewUrl: m.previewUrl,
          views: typeof m.views === "number" ? m.views : undefined,
          targetCourse: m?.targetCourse?.courseCode
            ? { courseCode: m.targetCourse.courseCode }
            : undefined,
        }));
        setPopular(mapped);
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

            {/* {popular.length > 0 && (
              <motion.div className="mt-8" variants={itemVariants}>
                <TrendingNow items={popular as any} />
              </motion.div>
            )} */}
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
