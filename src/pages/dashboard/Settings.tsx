import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft01Icon,
  Settings01Icon,
  FolderLibraryIcon,
  Notification01Icon,
  SquareLock02Icon,
  Database01Icon,
  ArrowRight02Icon,
  Search01Icon,
} from "hugeicons-react";
import SettingsNav from "@/components/settings/SettingsNav";
import SettingsPanel from "@/components/settings/SettingsPanel";
import type { SettingsSectionKey } from "@/components/settings/types";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState<SettingsSectionKey>("account");
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  // Read tab from URL params on mount
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["account", "academic", "privacy", "notifications", "data"].includes(tabParam)) {
      setActive(tabParam as SettingsSectionKey);
      setMobileView("detail");
    }
  }, [searchParams]);
  const sections = useMemo(
    () => [
      { key: "account" as const, label: "Account", icon: Settings01Icon },
      {
        key: "academic" as const,
        label: "Academic Details",
        icon: FolderLibraryIcon,
      },
      {
        key: "privacy" as const,
        label: "Privacy & Security",
        icon: SquareLock02Icon,
      },
      {
        key: "notifications" as const,
        label: "Notification Preferences",
        icon: Notification01Icon,
      },
      { key: "data" as const, label: "Data Control", icon: Database01Icon },
    ],
    []
  );

  const handleSectionClick = (key: SettingsSectionKey) => {
    setActive(key);
    setMobileView("detail");
  };

  const handleBackToList = () => {
    setMobileView("list");
  };

  const getSectionLabel = () => {
    return sections.find(s => s.key === active)?.label || "Settings";
  };

  return (
    <>
      <div className="relative z-sticky">
        <div className="bg-gradient-to-br from-[theme(colors.dashboard.gradientFrom)] to-[theme(colors.dashboard.gradientTo)]">
          <div className="px-2 sm:px-4 pt-16 sm:pt-20 pb-4 sm:pb-6">
            <div className="max-w-6xl mx-auto">
              {/* Mobile: Show back button when in detail view */}
              {mobileView === "detail" ? (
                <div className="md:hidden flex items-center gap-3 mb-4">
                <button
                    onClick={handleBackToList}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft01Icon size={18} />
                    Back
                </button>
              </div>
              ) : null}

              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground">
                  {mobileView === "detail" ? (
                    <span className="md:hidden block text-lg mb-1">
                      {getSectionLabel()}
                    </span>
                  ) : (
                    <span>Settings</span>
                  )}
                </h2>
                {mobileView === "list" && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Manage your account, privacy and preferences
                </p>
                )}
              </div>

              <div className="max-w-6xl mx-auto w-full relative z-10 mt-6 flex justify-center">
                <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200 px-3 py-2 w-full max-w-xl">
                  <Search01Icon size={16} className="text-gray-400" />
                  <input
                    placeholder="Search settings..."
                    className="w-full bg-transparent outline-none text-sm"
                    onKeyDown={(e) => {
                      const input = e.currentTarget as HTMLInputElement;
                      if (e.key === "Enter") {
                        const q = input.value.toLowerCase();
                        // simple client-side locate: switch to section if query matches
                        if (q.includes("account")) {
                          setActive("account");
                          setMobileView("detail");
                        } else if (q.includes("academic") || q.includes("study")) {
                          setActive("academic");
                          setMobileView("detail");
                        } else if (
                          q.includes("privacy") ||
                          q.includes("security")
                        ) {
                          setActive("privacy");
                          setMobileView("detail");
                        } else if (q.includes("notification")) {
                          setActive("notifications");
                          setMobileView("detail");
                        } else if (q.includes("data")) {
                          setActive("data");
                          setMobileView("detail");
                        }
                      }
                    }}
                  />
                  <button
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-brand text-white hover:bg-brand/90"
                    aria-label="Search"
                  >
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
        {/* Mobile: List view or Detail view */}
        <div className="md:hidden">
          {mobileView === "list" ? (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {sections.map(({ key, label, icon: Icon }, index) => (
                <React.Fragment key={key}>
                  <button
                    onClick={() => handleSectionClick(key)}
                    className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <Icon 
                      size={20} 
                      className={active === key ? "text-brand" : "text-gray-600"} 
                    />
                    <span className={`flex-1 text-left text-sm font-medium ${
                      active === key ? "text-brand" : "text-gray-900"
                    }`}>
                      {label}
                    </span>
                  </button>
                  {index < sections.length - 1 && (
                    <div className="h-px bg-gray-200 mx-4" />
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <SettingsPanel section={active} />
          )}
        </div>

        {/* Desktop: Keep tab layout */}
        <div className="hidden md:grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <SettingsNav
              sections={sections}
              active={active}
              onChange={setActive}
            />
          </div>
          <div className="col-span-12 md:col-span-8 lg:col-span-9">
            <SettingsPanel section={active} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
