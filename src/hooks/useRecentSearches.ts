import { useState, useEffect } from "react";

const STORAGE_KEY = "d4desi_recent_searches";
const MAX_RECENT_SEARCHES = 5;

interface RecentSearch {
  query: string;
  category?: string;
  city?: string;
  timestamp: number;
}

export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  const addSearch = (search: Omit<RecentSearch, "timestamp">) => {
    if (!search.query && !search.category && !search.city) return;

    const newSearch: RecentSearch = {
      ...search,
      timestamp: Date.now(),
    };

    setRecentSearches((prev) => {
      // Remove duplicates
      const filtered = prev.filter(
        (s) =>
          s.query !== search.query ||
          s.category !== search.category ||
          s.city !== search.city
      );

      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearSearches = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentSearches([]);
  };

  return { recentSearches, addSearch, clearSearches };
};
