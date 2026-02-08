export type SearchSuggestion = {
	id: string;
	title: string;
	type: "course" | "material" | "folder";
	subtitle?: string;
	icon?: React.ReactNode;
}

export type SearchResult<T> = {
	items: T[];
	pagination: {
	  total: number;
	  page: number;
	  pageSize: number;
	  totalPages: number;
	  hasMore: boolean;
	  hasPrev: boolean;
	  normalSearchPages?: number; // Pages from normal search before advanced search kicks in
	};
	usedAdvanced?: boolean; // Whether advanced search was used at any point
	isAdvancedSearch?: boolean; // Whether current results are from advanced search
  }