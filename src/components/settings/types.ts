export type SettingsSectionKey = "account" | "academic" | "privacy" | "notifications" | "data";

export interface SettingsSectionDef {
  key: SettingsSectionKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}


