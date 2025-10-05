import React from "react";
import { useNavigate } from "react-router-dom";

const ItemRow: React.FC<{
  title: string;
  subtitle?: string;
  actionLabel: string;
  onClick?: () => void;
}> = ({ title, subtitle, actionLabel, onClick }) => (
  <div className="flex items-start sm:items-center justify-between py-4 border-b last:border-0 border-gray-200">
    <div>
      <div className="text-sm font-medium text-gray-900">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
    <button
      onClick={onClick}
      className="mt-2 sm:mt-0 px-4 py-2 bg-brand text-white rounded-lg text-sm hover:bg-brand/90"
    >
      {actionLabel}
    </button>
  </div>
);

const PrivacySection: React.FC = () => {
  const navigate = useNavigate();

  // Redirect to forgot password page for password change
  const handlePasswordChange = () => {
    navigate("/auth/password/forgot");
  };

  return (
    <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Login & Security</h3>
      <hr className="my-4 border-gray-200" />
      <div className="divide-y divide-gray-200">
        <ItemRow
          title="Change Password"
          subtitle="************"
          actionLabel="Change"
          onClick={handlePasswordChange}
        />
      </div>
    </div>
  );
};

export default PrivacySection;
