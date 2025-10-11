import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSubmit,
  placeholder = "Search...",
  className = "",
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className={`flex flex-wrap gap-2 mb-4 ${className}`}
    >
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        className="flex-1 min-w-[240px]"
      />
      <Button type="submit" className="gap-1">
        <Search size={16} /> Search
      </Button>
    </form>
  );
};

export default SearchBar;
