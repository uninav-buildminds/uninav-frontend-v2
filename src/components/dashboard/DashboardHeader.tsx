import React from "react";
import { Search } from "lucide-react";

const DashboardHeader: React.FC<{ firstName?: string }> = ({ firstName = "Tee" }) => {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="bg-gradient-to-br from-[theme(colors.dashboard.gradientFrom)] to-[theme(colors.dashboard.gradientTo)]">
        <div className="px-2 sm:px-4 pt-10 sm:pt-14 pb-6 sm:pb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground">Welcome back, {firstName}! 👋</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Ready to explore today?</p>

            {/* Search */}
            <div className="mt-6 flex items-center justify-center">
              <div className="relative w-full max-w-xl">
                <input
                  placeholder="Enter a course code or course title"
                  className="w-full bg-white rounded-full border py-2.5 pl-4 pr-10 shadow-sm outline-none placeholder:text-muted-foreground/70"
                />
                <Search size={18} className="text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
              <button
                aria-label="Search"
                className="ml-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-white shrink-0 bg-brand"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Fade into content below */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-10 bg-gradient-to-b from-transparent to-white" />
    </section>
  );
};

export default DashboardHeader;
