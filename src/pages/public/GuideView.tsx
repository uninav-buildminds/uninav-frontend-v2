import React from "react";
import MaterialView from "../dashboard/MaterialView";

const GuideView: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="h-screen pt-2 sm:pt-3 px-2 sm:px-3 pb-2">
        <div className="h-[calc(100vh-0.5rem)] sm:h-[calc(100vh-0.75rem)] md:h-[calc(100vh-0.5rem)] lg:h-[calc(100vh-0.75rem)] rounded-t-3xl safari-rounded-top safari-accelerated bg-white border shadow-sm overflow-y-auto scroll-surface">
          <MaterialView isPublic={true} backTo="/guides" />
        </div>
      </div>
    </div>
  );
};

export default GuideView;
