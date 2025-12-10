import React from "react";
import MaterialView from "../dashboard/MaterialView";

// Public wrapper component for viewing materials without authentication
const PublicMaterialView: React.FC = () => {
  return <MaterialView isPublic={true} />;
};

export default PublicMaterialView;

