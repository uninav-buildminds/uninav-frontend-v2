import React from "react";
import FolderView from "../dashboard/FolderView";

// Public wrapper component for viewing folders without authentication
const PublicFolderView: React.FC = () => {
  return <FolderView isPublic={true} />;
};

export default PublicFolderView;
