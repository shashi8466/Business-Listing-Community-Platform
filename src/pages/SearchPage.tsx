import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search, MapPin, Star, X, Bookmark, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchSuggestions from "@/components/SearchSuggestions";
import SearchPagination from "@/components/SearchPagination";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { CATEGORIES, US_CITIES } from "@/types";

const ITEMS_PER_PAGE = 10;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "rating");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { recentSearches, addSearch, clearSearches } = useRecentSearches();

  const { businesses, loading } = useBusinesses({
    category: selectedCategory || undefined,
    city: selectedCity || undefined,
    searchQuery: searchQuery || undefined,
  });

  // Sort businesses based on selected sort option
  const sortedBusinesses = useMemo(() => {
    return [...businesses].sort((a, b) => {
      switch (sortBy) {
        case "reviews":
          return b.reviewCount - a.reviewCount;
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "rating":
        default:
          return b.rating - a.rating;
      }
    });
  }, [businesses, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedBusinesses.length / ITEMS_PER_PAGE);
  const paginatedBusinesses = sortedBusinesses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setCurrentPage(1);
    updateUrlParams(1);
    addSearch({ query: searchQuery, category: selectedCategory, city: selectedCity });
  };

  const updateUrlParams = (page = currentPage) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedCity) params.set("city", selectedCity);
    if (sortBy && sortBy !== "rating") params.set("sort", sortBy);
    if (page > 1) params.set("page", page.toString());
    setSearchParams(params);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    if (value === "rating") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlParams(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedCity("");
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleSelectRecent = (search: { query: string; category?: string; city?: string }) => {
    setSearchQuery(search.query);
    if (search.category) setSelectedCategory(search.category);
    if (search.city) setSelectedCity(search.city);
    setShowSuggestions(false);
  };

  const getCategoryName = (id: string) =>
    CATEGORIES.find((c) => c.id === id)?.name || id;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedCity, searchQuery]);

  return (
    <>
      <Helmet>
        <title>
          {searchQuery
            ? `Search: ${searchQuery} - BusinessHub`
            : "Search Businesses - BusinessHub"}
        </title>
        <meta
          name="description"
          content="Search for Desi businesses and services across the United States"
        />
        <link rel="canonical" href="https://BusinessHub.com/search" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Search Header */}
          <div className="bg-muted/50 border-b border-border py-6">
            <div className="container mx-auto px-4">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="search-query"
                    name="search"
                    type="text"
                    placeholder="Search businesses, services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="pl-10 h-12"
                    autoComplete="off"
                  />
                  <SearchSuggestions
                    query={searchQuery}
                    recentSearches={recentSearches}
                    onSelectSuggestion={handleSelectSuggestion}
                    onSelectRecent={handleSelectRecent}
                    onClearRecent={clearSearches}
                    isOpen={showSuggestions}
                  />
                </div>
                {/* Category dropdown - visible on mobile, hidden on desktop */}
                <Select
                  value={selectedCategory || "all"}
                  onValueChange={(val) => setSelectedCategory(val === "all" ? "" : val)}
                >
                  <SelectTrigger id="category-filter" className="w-full md:hidden h-12">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedCity || "all"}
                  onValueChange={(val) => setSelectedCity(val === "all" ? "" : val)}
                >
                  <SelectTrigger id="city-filter" className="w-full md:w-48 h-12">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">All Cities</SelectItem>
                    {US_CITIES.map((city) => (
                      <SelectItem key={city.city} value={city.city}>
                        {city.city}, {city.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" className="h-12 px-8">
                  Search
                </Button>
              </form>

              {/* Active Filters */}
              {(selectedCategory || selectedCity || searchQuery) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-sm text-muted-foreground self-center">
                    Filters:
                  </span>
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      "{searchQuery}"
                      <button onClick={() => setSearchQuery("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge variant="secondary" className="gap-1">
                      {getCategoryName(selectedCategory)}
                      <button onClick={() => setSelectedCategory("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedCity && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedCity}
                      <button onClick={() => setSelectedCity("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <aside className="lg:w-64 flex-shrink-0 hidden lg:block">
                <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                  <h3 className="font-semibold text-foreground mb-4">Categories</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        !selectedCategory
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      All Categories
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === cat.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Results */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {loading
                        ? "Loading..."
                        : `${sortedBusinesses.length} Results`}
                    </h2>
                    {!loading && sortedBusinesses.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                        {Math.min(currentPage * ITEMS_PER_PAGE, sortedBusinesses.length)}{" "}
                        of {sortedBusinesses.length}
                      </p>
                    )}
                  </div>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="reviews">Most Reviews</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-card border border-border rounded-xl p-4 animate-pulse"
                      >
                        <div className="flex gap-4">
                          <div className="w-48 h-32 bg-muted rounded-lg" />
                          <div className="flex-1 space-y-3">
                            <div className="h-6 bg-muted rounded w-1/3" />
                            <div className="h-4 bg-muted rounded w-full" />
                            <div className="h-4 bg-muted rounded w-2/3" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : sortedBusinesses.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">
                      No businesses found matching your criteria.
                    </p>
                    <Button variant="outline" onClick={clearFilters} className="mt-4">
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginatedBusinesses.map((business) => (
                        <Link
                          key={business.id}
                          to={`/business/${business.id}`}
                          className="flex flex-col md:flex-row bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                          <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                            <img
                              src={business.images[0] || "/placeholder.svg"}
                              alt={business.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  {business.featured && (
                                    <Badge className="bg-accent text-accent-foreground">
                                      Featured
                                    </Badge>
                                  )}
                                  {business.verified && (
                                    <Badge
                                      variant="outline"
                                      className="text-primary border-primary"
                                    >
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
                                  {business.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {getCategoryName(business.category)}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Star className="h-5 w-5 fill-accent text-accent" />
                                <span className="font-semibold">{business.rating}</span>
                                <span className="text-muted-foreground">
                                  ({business.reviewCount})
                                </span>
                              </div>
                            </div>
                            <p className="text-muted-foreground line-clamp-2 mb-3">
                              {business.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {business.address.city}, {business.address.state}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="gap-1"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  <Bookmark className="h-4 w-4" />
                                  <span className="hidden sm:inline">Save</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  <span className="hidden sm:inline">Get Quote</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <SearchPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SearchPage;
