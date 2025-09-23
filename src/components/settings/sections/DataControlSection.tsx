import React from "react";

const DataControlSection: React.FC = () => {
  return (
    <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Data Control</h3>
      <hr className="my-4 border-gray-200" />
      <div className="space-y-3 text-sm text-gray-700">
        <p>Download a copy of your data or request deletion of your account.</p>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Download Data</button>
          <button className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default DataControlSection;


