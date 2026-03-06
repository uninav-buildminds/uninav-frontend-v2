import React from "react";
import BatchPreviewUpdater from "@/components/dashboard/admin/BatchPreviewUpdater";

const BatchImageGenerator: React.FC = () => (
  <div className="p-6 max-w-4xl mx-auto">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Preview Image Generator</h1>
      <p className="text-sm text-gray-500 mt-1">
        Admin tool — generates and uploads preview images for PDF and Google Drive materials.
      </p>
    </div>
    <BatchPreviewUpdater />
  </div>
);

export default BatchImageGenerator;
