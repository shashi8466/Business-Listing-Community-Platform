import { Clock, Search, X } from "lucide-react";
import { CATEGORIES } from "@/types";

interface RecentSearch {
  query: string;
  category?: string;
  city?: string;
  timestamp: number;
}

interface SearchSuggestionsProps {
  query: string;
  recentSearches: RecentSearch[];
  onSelectSuggestion: (suggestion: string) => void;
  onSelectRecent: (search: RecentSearch) => void;
  onClearRecent: () => void;
  isOpen: boolean;
}

const SearchSuggestions = ({
  query,
  recentSearches,
  onSelectSuggestion,
  onSelectRecent,
  onClearRecent,
  isOpen,
}: SearchSuggestionsProps) => {
  if (!isOpen) return null;

  // Generate suggestions from categories and common terms
  const categorySuggestions = CATEGORIES.filter((cat) =>
    cat.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const commonTerms = [
    "Indian restaurants near me",
    "Desi grocery stores",
    "Indian tutors",
    "Immigration lawyers",
    "Real estate agents",
    "Wedding services",
    "Temple services",
    "Yoga classes",
  ];

  const termSuggestions = query
    ? commonTerms
        .filter((term) => term.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
    : [];

  const showRecent = !query && recentSearches.length > 0;
  const showSuggestions = query && (categorySuggestions.length > 0 || termSuggestions.length > 0);

  if (!showRecent && !showSuggestions) return null;

  const getCategoryName = (id?: string) =>
    id ? CATEGORIES.find((c) => c.id === id)?.name || id : "";

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
      {showRecent && (
        <>
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
            <span className="text-sm font-medium text-muted-foreground">
              Recent Searches
            </span>
            <button
              onClick={onClearRecent}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          </div>
          <div className="py-1">
            {recentSearches.map((search, idx) => (
              <button
                key={idx}
                onClick={() => onSelectRecent(search)}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted text-left"
              >
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <span className="text-sm text-foreground">
                    {search.query || getCategoryName(search.category) || search.city}
                  </span>
                  {(search.category || search.city) && search.query && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {[getCategoryName(search.category), search.city]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {showSuggestions && (
        <div className="py-1">
          {categorySuggestions.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectSuggestion(cat.name)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted text-left"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{cat.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                Category
              </span>
            </button>
          ))}
          {termSuggestions.map((term, idx) => (
            <button
              key={idx}
              onClick={() => onSelectSuggestion(term)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted text-left"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{term}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
