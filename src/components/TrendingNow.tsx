import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export interface TrendingItem {
  id: string;
  slug?: string;
  label?: string;
  tags?: string[];
  previewUrl?: string;
  views?: number;
  targetCourse?: {
    courseCode?: string;
  };
}

interface TrendingNowProps {
  items: TrendingItem[];
}

const TrendingNow: React.FC<TrendingNowProps> = ({ items }) => {
  const navigate = useNavigate();
  const { loggedIn } = useAuth();

  if (!items || items.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="text-sm text-muted-foreground mb-3">Trending now</div>
      <div className="relative overflow-hidden">
        <motion.div
          className="flex gap-4 px-1"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ willChange: "transform" }}
       >
          {[...items, ...items].map((m, idx) => (
            <button
              key={`${m.id}-${idx}`}
              onClick={() => {
                if (!loggedIn) return navigate("/auth/signin");
                navigate(`/dashboard/material/${m.slug}`);
              }}
              className="group relative w-56 h-32 shrink-0 rounded-2xl border border-gray-200/70 bg-white/60 backdrop-blur-sm overflow-hidden text-left shadow-sm hover:shadow-md transition-all duration-200"
            >
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
                    {(m.tags?.slice?.(0, 2) || []).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-brand/10 text-brand"
                      >
                        {t}
                      </span>
                    ))}
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="-mr-0.5">
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
    </div>
  );
};

export default TrendingNow;


