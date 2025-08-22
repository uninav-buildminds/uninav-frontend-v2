import React from "react";
import { Search, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

const Navbar: React.FC = () => <Header />;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const imageVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 } }
};

const HeroSection: React.FC = () => {
  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{ backgroundImage: "url(/assets/hero-bg.svg)", backgroundSize: "cover", backgroundPosition: "center" }}
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
              <div className="whitespace-nowrap">No More Scrambling for Notes – Get</div>
              <div className="whitespace-nowrap">Everything You Need in One Place</div>
            </motion.h1>
            <motion.p className="mt-4 text-base sm:text-lg text-muted-foreground" variants={itemVariants}>
              Access a vast library of study resources, connect with peers, and achieve your academic goals.
            </motion.p>

            {/* Search bar */}
            <motion.div className="mt-8 flex items-center justify-center gap-3" variants={itemVariants}>
              <div className="relative w-full max-w-xl">
                <input
                  placeholder="Search courses..."
                  className="w-full bg-white rounded-full border py-2 pl-4 pr-10 shadow-sm outline-none placeholder:text-muted-foreground/70"
                />
                <Search size={18} className="text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
              <button
                aria-label="Search"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white shrink-0 bg-brand"
              >
                <ArrowRight size={18} />
              </button>
            </motion.div>
          </motion.div>

        </div>

        {/* Dashboard preview image*/}
        <motion.div className="relative pb-16 md:pb-24" variants={imageVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
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
