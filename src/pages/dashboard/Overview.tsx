import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import { Award01Icon, UploadSquare01Icon, DownloadSquare01Icon, Bookmark01Icon } from "hugeicons-react";

const Overview: React.FC = () => {
  return (
    <DashboardLayout>
      <DashboardHeader firstName="Tee" />
      <div className="p-4 sm:p-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={<Award01Icon size={20} />} title="Your Points" value="85%" description="You're doing great! Upload 3 more materials to unlock Ad‑Free Week" />
          <MetricCard icon={<DownloadSquare01Icon size={20} />} title="Total Downloads" value="120" description="You have downloaded helpful materials. You're on track to complete academic goals" />
          <MetricCard icon={<UploadSquare01Icon size={20} />} title="Total Uploads" value="50" description="You have helped a lot of students. You're making a real difference" />
          <MetricCard icon={<Bookmark01Icon size={20} />} title="Saved Materials" value="12" description="Your materials were downloaded 120 times. You're making a difference!" />
        </div>

        {/* Content Sections */}
        <div className="mt-8 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Materials</h3>
              <button className="text-sm text-brand">View All →</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`recent-${i}`} className="h-40 rounded-xl border bg-white" />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recommendations</h3>
              <button className="text-sm text-brand">View All →</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`reco-${i}`} className="h-40 rounded-xl border bg-white" />
              ))}
            </div>
          </section>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Overview;
