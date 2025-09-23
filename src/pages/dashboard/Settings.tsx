import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft01Icon,
  Settings01Icon,
  FolderLibraryIcon,
  Notification01Icon,
  SquareLock02Icon,
  Database01Icon,
  ArrowRight02Icon,
  Search01Icon
} from "hugeicons-react";
import SettingsNav from "@/components/settings/SettingsNav";
import SettingsPanel from "@/components/settings/SettingsPanel";
import type { SettingsSectionKey } from "@/components/settings/types";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState<SettingsSectionKey>("account");
  const sections = useMemo(() => ([
    { key: "account" as const, label: "Account", icon: Settings01Icon },
    { key: "academic" as const, label: "Academic Details", icon: FolderLibraryIcon },
    { key: "privacy" as const, label: "Privacy & Security", icon: SquareLock02Icon },
    { key: "notifications" as const, label: "Notification Preferences", icon: Notification01Icon },
    { key: "data" as const, label: "Data Control", icon: Database01Icon },
  ]), []);

  return (
    <DashboardLayout>
      <div className="relative z-sticky">
        <div className="bg-gradient-to-br from-[theme(colors.dashboard.gradientFrom)] to-[theme(colors.dashboard.gradientTo)]">
          <div className="px-2 sm:px-4 pt-8 sm:pt-12 pb-4 sm:pb-6">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-col gap-3">
              <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="hidden sm:inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft01Icon size={18} />
                Back to Dashboard
              </button>
              </div>

              <div className="max-w-6xl mx-auto w-full">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground">Settings</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage your account, privacy and preferences</p>
              </div>

              <div className="max-w-6xl mx-auto w-full">
                <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200 px-3 py-2">
                  <Search01Icon size={16} className="text-gray-400" />
                  <input
                    placeholder="Search settings..."
                    className="w-full bg-transparent outline-none text-sm"
                    onKeyDown={(e) => {
                      const input = e.currentTarget as HTMLInputElement;
                      if (e.key === 'Enter') {
                        const q = input.value.toLowerCase();
                        // simple client-side locate: switch to section if query matches
                        if (q.includes('account')) setActive('account');
                        else if (q.includes('academic') || q.includes('study')) setActive('academic');
                        else if (q.includes('privacy') || q.includes('security')) setActive('privacy');
                        else if (q.includes('notification')) setActive('notifications');
                        else if (q.includes('data')) setActive('data');
                      }
                    }}
                  />
                  <button className="flex items-center justify-center w-8 h-8 rounded-full bg-brand text-white hover:bg-brand/90" aria-label="Search">
                    <ArrowRight02Icon size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-10 bg-gradient-to-b from-transparent to-white" />
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-8 pb-28">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <SettingsNav sections={sections} active={active} onChange={setActive} />
          </div>
          <div className="col-span-12 md:col-span-8 lg:col-span-9">
            <SettingsPanel section={active} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;


