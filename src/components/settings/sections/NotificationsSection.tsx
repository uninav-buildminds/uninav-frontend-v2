import React from "react";
import { Switch } from "@/components/ui/switch";

const ToggleRow: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center justify-between py-4 border-b last:border-0 border-gray-200">
    <div className="text-sm text-gray-800">{label}</div>
    <Switch defaultChecked className="data-[state=checked]:bg-brand" />
  </div>
);

const NotificationsSection: React.FC = () => {
  return (
    <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">How we notify you</h3>
      <hr className="my-4 border-gray-200" />
      <div className="divide-y divide-gray-200">
        <ToggleRow label="Email me when my uploads are approved or rejected" />
        <ToggleRow label="Email me about new followers" />
        <ToggleRow label="Email me about points and rewards" />
        <ToggleRow label="Send me weekly recommendations for my courses" />
      </div>
    </div>
  );
};

export default NotificationsSection;


