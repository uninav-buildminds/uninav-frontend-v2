import React from "react";
import Sidebar from "./Sidebar";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Fixed gutters
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="md:flex">
        <Sidebar />
        <main className="flex-1 min-h-screen">
          {/* Tiny fixed outer spacing (persists when scrolling) */}
          <div className="pt-2 sm:pt-3 px-2 sm:px-3 h-screen">
            <div className="h-[calc(100vh-0.5rem)] sm:h-[calc(100vh-0.75rem)] rounded-t-3xl bg-white border shadow-sm overflow-y-auto scroll-surface">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
