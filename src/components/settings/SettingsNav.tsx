import React from "react";
import type { SettingsSectionKey, SettingsSectionDef } from "./types";

interface Props {
  sections: readonly { key: SettingsSectionKey; label: string; icon: any }[];
  active: SettingsSectionKey;
  onChange: (key: SettingsSectionKey) => void;
}

const SettingsNav: React.FC<Props> = ({ sections, active, onChange }) => {
  return (
    <div>
      {/* Mobile/Tablet horizontal tabs */}
      <div className="md:hidden overflow-x-auto">
        <div className="flex gap-2">
          {sections.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap border ${
                active === key ? "bg-brand text-white border-brand" : "bg-white text-gray-800 border-gray-200"
              }`}
            >
              <Icon size={16} />
              <span className="hidden text-sm sm:hidden">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop vertical nav */}
      <div className="hidden md:block rounded-2xl bg-[#EEF1FF] p-4">
        <div className="space-y-2">
          {sections.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                active === key ? "bg-brand text-white" : "bg-white/40 text-gray-800 hover:bg-white"
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsNav;


