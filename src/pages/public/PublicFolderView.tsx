import React from "react";
import FolderView from "../dashboard/FolderView";

// Public wrapper component for viewing folders without authentication
// Provides overflow protection to match dashboard layout behavior
const PublicFolderView: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <FolderView isPublic={true} />
    </div>
  );
};

export default PublicFolderView;
