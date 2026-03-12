import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Database01Icon, FolderLibraryIcon, Notification01Icon, Search01Icon, Settings01Icon, SquareLock02Icon } from "@hugeicons/core-free-icons";
import SettingsNav from "@/components/settings/SettingsNav";
import SettingsPanel from "@/components/settings/SettingsPanel";
import type { SettingsSectionKey } from "@/components/settings/types";

/** Flat list of every setting item for search. Each entry maps to a section. */
const SEARCH_INDEX: { label: string; description: string; section: SettingsSectionKey }[] = [
  { label: "Profile & Visibility", description: "Edit your name, username, avatar", section: "account" },
  { label: "Interests", description: "Pick topics to personalise recommendations", section: "account" },
  { label: "Bio", description: "Tell others about yourself", section: "account" },
  { label: "Profile picture", description: "Update your avatar or photo", section: "account" },
  { label: "Logout", description: "Sign out of your account", section: "account" },
  { label: "Study Information", description: "University, department and level", section: "academic" },
  { label: "Department", description: "Change your department", section: "academic" },
  { label: "Level", description: "Change your year / level", section: "academic" },
  { label: "University", description: "University of Ibadan", section: "academic" },
  { label: "Privacy & Security", description: "Password, account visibility settings", section: "privacy" },
  { label: "Password", description: "Change your account password", section: "privacy" },
  { label: "Notification Preferences", description: "Control which notifications you receive", section: "notifications" },
  { label: "Email notifications", description: "Toggle email alerts", section: "notifications" },
  { label: "Data Control", description: "Export or delete your account data", section: "data" },
  { label: "Export data", description: "Download a copy of your data", section: "data" },
  { label: "Delete account", description: "Permanently remove your account", section: "data" },
];

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState<SettingsSectionKey>("account");
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return SEARCH_INDEX.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

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
                  <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} size={18} />
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
                  <HugeiconsIcon icon={Search01Icon} strokeWidth={1.5} size={16} className="text-gray-400" />
                  <input
                    placeholder="Search settings..."
                    className="w-full bg-transparent outline-none text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-gray-400 hover:text-gray-600 text-xs px-1"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-10 bg-gradient-to-b from-transparent to-white" />
      </div>

      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-8 pb-28">
        {/* Search results — shown on all breakpoints when query is active */}
        {searchResults !== null ? (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {searchResults.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No settings found for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              searchResults.map((item, index) => {
                const sectionDef = sections.find(s => s.key === item.section);
                return (
                  <React.Fragment key={`${item.section}-${item.label}`}>
                    <button
                      onClick={() => {
                        setActive(item.section);
                        setMobileView("detail");
                        setSearchQuery("");
                      }}
                      className="w-full flex items-start gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      {sectionDef && (
                        <HugeiconsIcon
                          icon={sectionDef.icon}
                          strokeWidth={1.5}
                          size={18}
                          className="text-gray-400 mt-0.5 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>
                      </div>
                      <span className="text-xs text-brand/70 bg-brand/10 px-2 py-0.5 rounded-full flex-shrink-0 self-center">
                        {sectionDef?.label}
                      </span>
                    </button>
                    {index < searchResults.length - 1 && (
                      <div className="h-px bg-gray-100 mx-4" />
                    )}
                  </React.Fragment>
                );
              })
            )}
          </div>
        ) : (
          <>
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
                        <HugeiconsIcon
                          icon={Icon}
                          strokeWidth={1.5}
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
          </>
        )}
      </div>
    </>
  );
};

export default SettingsPage;
