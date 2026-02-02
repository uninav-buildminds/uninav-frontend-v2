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
	};
  }