import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Star, MapPin, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useBusinesses } from "@/hooks/useBusinesses";
import { CATEGORIES, US_CITIES } from "@/types";

const CityLandingPage = () => {
  const { city } = useParams<{ city: string }>();

  // Find the city (handle both slug format and regular name)
  const matchedCity = US_CITIES.find(
    (c) =>
      c.city.toLowerCase().replace(/\s+/g, "-") === city?.toLowerCase() ||
      c.city.toLowerCase() === city?.toLowerCase()
  );

  const { businesses, loading } = useBusinesses({
    city: matchedCity?.city,
    limitCount: 12,
  });

  // Get category counts for this city
  const categoryCounts = businesses.reduce((acc, biz) => {
    acc[biz.category] = (acc[biz.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = CATEGORIES.filter((cat) => categoryCounts[cat.id])
    .sort((a, b) => (categoryCounts[b.id] || 0) - (categoryCounts[a.id] || 0))
    .slice(0, 6);

  if (!matchedCity) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">City Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find "{city}" in our coverage area.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/cities">
                <Button variant="outline">Browse All Cities</Button>
              </Link>
              <Link to="/">
                <Button>Go Home</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getCategoryName = (id: string) =>
    CATEGORIES.find((c) => c.id === id)?.name || id;

  return (
    <>
      <Helmet>
        <title>
          Desi Businesses in {matchedCity.city}, {matchedCity.state} | BusinessHub
        </title>
        <meta
          name="description"
          content={`Find trusted Desi businesses, Indian restaurants, tutors, real estate agents and more in ${matchedCity.city}, ${matchedCity.state}. Connect with your local Desi community.`}
        />
        <link
          rel="canonical"
          href={`https://BusinessHub.com/${matchedCity.city.toLowerCase().replace(/\s+/g, "-")}`}
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Desi Businesses in ${matchedCity.city}, ${matchedCity.state}`,
            description: `Directory of Desi businesses and services in ${matchedCity.city}, ${matchedCity.state}`,
            url: `https://BusinessHub.com/${matchedCity.city.toLowerCase().replace(/\s+/g, "-")}`,
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-hero py-16 text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4">
                <MapPin className="h-3 w-3 mr-1" />
                {matchedCity.state}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Desi Businesses in {matchedCity.city}
              </h1>
              <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
                Discover the best Indian restaurants, tutors, real estate agents,
                and more serving the Desi community in {matchedCity.city},{" "}
                {matchedCity.state}.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to={`/search?city=${matchedCity.city}`}>
                  <Button size="lg" variant="secondary">
                    Browse All Services
                  </Button>
                </Link>
                <Link to="/list-business">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    List Your Business
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* City Intro */}
          <section className="py-12 bg-muted/50 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Your Local Desi Community Hub
                </h2>
                <p className="text-muted-foreground">
                  {matchedCity.city} is home to a thriving Desi community. From
                  authentic Indian cuisine to professional services, find
                  everything you need to connect with businesses that understand
                  your culture and values.
                </p>
              </div>
            </div>
          </section>

          {/* Top Categories */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Popular Categories in {matchedCity.city}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {(topCategories.length > 0 ? topCategories : CATEGORIES.slice(0, 6)).map(
                  (cat) => (
                    <Link
                      key={cat.id}
                      to={`/search?category=${cat.id}&city=${matchedCity.city}`}
                      className="group p-4 bg-card border border-border rounded-xl text-center hover:border-primary hover:shadow-md transition-all"
                    >
                      <div className="text-3xl mb-2">{cat.icon}</div>
                      <h3 className="font-medium text-foreground group-hover:text-primary text-sm">
                        {cat.name}
                      </h3>
                      {categoryCounts[cat.id] && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {categoryCounts[cat.id]} listings
                        </p>
                      )}
                    </Link>
                  )
                )}
              </div>
              <div className="text-center mt-6">
                <Link to={`/search?city=${matchedCity.city}`}>
                  <Button variant="outline" className="gap-2">
                    View All Categories <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Featured Businesses */}
          <section className="py-12 bg-muted/50">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Featured in {matchedCity.city}
                  </h2>
                </div>
                <Link to={`/search?city=${matchedCity.city}`}>
                  <Button variant="outline" className="gap-2">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-card border border-border rounded-xl overflow-hidden animate-pulse"
                    >
                      <div className="h-48 bg-muted" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="h-6 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : businesses.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg mb-4">
                    No businesses listed in {matchedCity.city} yet
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Be the first to list your business and reach the local Desi
                    community!
                  </p>
                  <Link to="/list-business">
                    <Button>List Your Business</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businesses.slice(0, 6).map((business) => (
                    <Link
                      key={business.id}
                      to={`/business/${business.id}`}
                      className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="relative">
                        <img
                          src={business.images[0] || "/placeholder.svg"}
                          alt={business.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {business.featured && (
                          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span className="font-semibold">{business.rating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({business.reviewCount})
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                          {business.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {getCategoryName(business.category)}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {business.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Nearby Cities */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Explore Nearby Cities
              </h2>
              <div className="flex flex-wrap gap-3">
                {US_CITIES.filter((c) => c.city !== matchedCity.city)
                  .slice(0, 8)
                  .map((city) => (
                    <Link
                      key={city.city}
                      to={`/${city.city.toLowerCase().replace(/\s+/g, "-")}`}
                      className="px-4 py-2 bg-card border border-border rounded-full text-sm hover:border-primary hover:text-primary transition-colors"
                    >
                      {city.city}, {city.state}
                    </Link>
                  ))}
                <Link
                  to="/cities"
                  className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                >
                  View All Cities →
                </Link>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-gradient-hero text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Own a Business in {matchedCity.city}?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                Join the largest Desi business directory and connect with
                thousands of potential customers in your area.
              </p>
              <Link to="/list-business">
                <Button size="lg" variant="secondary">
                  List Your Business Free
                </Button>
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CityLandingPage;
