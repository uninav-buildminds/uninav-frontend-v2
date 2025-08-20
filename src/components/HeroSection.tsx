import React from "react";
import { Search, ArrowRight } from "lucide-react";
import Header from "@/components/Header";

const Navbar: React.FC = () => <Header />;

const HeroSection: React.FC = () => {
  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{ backgroundImage: "url(/assets/hero-bg.png)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          {/* Floating navbar */}
          <div className="pt-6 md:pt-10">
            <div className="mx-auto max-w-5xl">
              <Navbar />
            </div>
          </div>

          {/* Hero copy */}
          <div className="relative z-10 mx-auto max-w-4xl text-center py-20 md:py-28">
            <h1 className="font-semibold tracking-tight text-xl sm:text-4xl md:text-6xl leading-tight text-foreground">
              <span className="whitespace-nowrap inline-block">No More Scrambling for Notes – Get</span>
              <br className="block" />
              <span className="whitespace-nowrap inline-block">Everything You Need in One Place</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Access a vast library of study resources, connect with peers, and achieve your academic goals.
            </p>

            {/* Search bar */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="relative w-full max-w-xl">
                <input
                  placeholder="Enter a course code or course title"
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
            </div>
          </div>

        </div>

        {/* Dashboard preview image*/}
        <div className="relative pb-16 md:pb-24">
          <img
            src="/assets/demo-dash.png"
            alt="Dashboard preview"
            className="block w-[min(1200px,96%)] mx-auto"
          />
        </div>

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


