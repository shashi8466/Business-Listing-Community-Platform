import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import heroPattern from "@/assets/hero-pattern.jpg";
import { US_CITIES } from "@/types";

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const popularSearches = [
    "Indian Restaurants",
    "Tutors",
    "Real Estate Agents",
    "Temples",
    "Immigration Lawyers",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCity) params.set("city", selectedCity);
    navigate(`/search?${params.toString()}`);
  };

  const handlePopularSearch = (term: string) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <section
      className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroPattern})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-hero opacity-80" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 max-w-4xl mx-auto leading-tight">
          Discover Trusted Desi
          <br />
          <span className="text-accent">Businesses & Services</span>
        </h1>
        
        <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto">
          Your one-stop destination for connecting with the Desi community across the United States
        </p>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="bg-card rounded-xl p-4 md:p-6 shadow-xl max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="hero-search"
                name="search"
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 md:h-14 text-base border-border bg-background"
              />
            </div>
            <div className="flex-1">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-12 md:h-14 text-base pl-10">
                  <MapPin className="absolute left-4 h-5 w-5 text-muted-foreground" />
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent className="bg-popover max-h-60">
                  <SelectItem value="all">All Cities</SelectItem>
                  {US_CITIES.map((city) => (
                    <SelectItem key={city.city} value={city.city}>
                      {city.city}, {city.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" size="lg" className="h-12 md:h-14 px-8 text-base font-semibold">
              Search
            </Button>
          </div>

          {/* Popular Searches */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {popularSearches.map((search) => (
              <button
                key={search}
                type="button"
                onClick={() => handlePopularSearch(search)}
                className="text-sm text-primary hover:text-secondary transition-colors hover:underline"
              >
                {search}
              </button>
            ))}
          </div>
        </form>

        {/* Stats */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16 text-primary-foreground">
          <div>
            <div className="text-3xl md:text-4xl font-bold">10,000+</div>
            <div className="text-sm md:text-base opacity-90">Businesses Listed</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold">50+</div>
            <div className="text-sm md:text-base opacity-90">Cities Covered</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold">100,000+</div>
            <div className="text-sm md:text-base opacity-90">Community Members</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
