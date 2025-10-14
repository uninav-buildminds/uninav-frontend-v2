export interface SearchSuggestion {
  id: string;
  title: string;
  type: "course" | "material";
  subtitle?: string;
  icon?: React.ReactNode;
}