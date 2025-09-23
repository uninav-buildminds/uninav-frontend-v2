import React from "react";
import type { SettingsSectionKey } from "./types";
import AccountSection from "./sections/AccountSection";
import AcademicSection from "./sections/AcademicSection";
import PrivacySection from "./sections/PrivacySection";
import NotificationsSection from "./sections/NotificationsSection";
import DataControlSection from "./sections/DataControlSection";

const SettingsPanel: React.FC<{ section: SettingsSectionKey }> = ({ section }) => {
  return (
    <div className="rounded-2xl bg-[#EEF1FF] p-4 sm:p-6">
      {section === "account" && <AccountSection />}
      {section === "academic" && <AcademicSection />}
      {section === "privacy" && <PrivacySection />}
      {section === "notifications" && <NotificationsSection />}
      {section === "data" && <DataControlSection />}
    </div>
  );
};

export default SettingsPanel;


