import React from "react";

const ItemRow: React.FC<{ title: string; subtitle?: string; actionLabel: string }> = ({ title, subtitle, actionLabel }) => (
  <div className="flex items-start sm:items-center justify-between py-4 border-b last:border-0 border-gray-200">
    <div>
      <div className="text-sm font-medium text-gray-900">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
    <button className="mt-2 sm:mt-0 px-4 py-2 bg-brand text-white rounded-lg text-sm hover:bg-brand/90">{actionLabel}</button>
  </div>
);

const PrivacySection: React.FC = () => {
  return (
    <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Login & Security</h3>
      <hr className="my-4 border-gray-200" />
      <div className="divide-y divide-gray-200">
        <ItemRow title="Change Email Address" subtitle="teedaniels356091.stu.ui.ng" actionLabel="Change" />
        <ItemRow title="Change Password" subtitle="************" actionLabel="Change" />
        <ItemRow title="Two-Factor Authentication" actionLabel="Enable" />
      </div>
    </div>
  );
};

export default PrivacySection;


