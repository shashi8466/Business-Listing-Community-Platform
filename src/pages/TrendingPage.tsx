import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Star, MapPin, TrendingUp, Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useBusinesses } from "@/hooks/useBusinesses";
import { CATEGORIES } from "@/types";

const TrendingPage = () => {
  // Get businesses sorted by review count (proxy for popularity/activity)
  const { businesses, loading } = useBusinesses({});

  // Sort by review count and rating for trending (most activity + quality)
  const trendingBusinesses = [...businesses]
    .sort((a, b) => {
      const scoreA = a.reviewCount * 0.6 + a.rating * 0.4;
      const scoreB = b.reviewCount * 0.6 + b.rating * 0.4;
      return scoreB - scoreA;
    })
    .slice(0, 12);

  const getCategoryName = (id: string) =>
    CATEGORIES.find((c) => c.id === id)?.name || id;

  return (
    <>
      <Helmet>
        <title>Trending Businesses - Popular Desi Services | BusinessHub</title>
        <meta
          name="description"
          content="Discover trending Desi businesses with the most activity, reviews, and customer engagement. Find what's hot in your community."
        />
        <link rel="canonical" href="https://BusinessHub.com/trending" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-hero py-16 text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full mb-6">
                <Flame className="h-5 w-5" />
                <span className="text-sm font-medium">Hot Right Now</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Trending Businesses
              </h1>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Discover the most popular businesses in the Desi community based on
                recent activity, reviews, and customer engagement.
              </p>
            </div>
          </section>

          {/* Trending Stats */}
          <section className="py-8 bg-muted/50 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {businesses.length}+
                  </div>
                  <div className="text-sm text-muted-foreground">Active Businesses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {businesses.reduce((sum, b) => sum + b.reviewCount, 0)}+
                  </div>
                  <div className="text-sm text-muted-foreground">Total Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {CATEGORIES.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
              </div>
            </div>
          </section>

          {/* Trending Listings */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Top Trending
                  </h2>
                </div>
                <Link to="/search">
                  <Button variant="outline" className="gap-2">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
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
              ) : trendingBusinesses.length === 0 ? (
                <div className="text-center py-12 bg-muted/50 rounded-xl">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg mb-4">
                    No trending businesses yet
                  </p>
                  <Link to="/search">
                    <Button>Browse All Businesses</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trendingBusinesses.map((business, index) => (
                    <Link
                      key={business.id}
                      to={`/business/${business.id}`}
                      className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all relative"
                    >
                      <div className="absolute top-4 left-4 z-10 flex gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-background/90 backdrop-blur gap-1"
                        >
                          <TrendingUp className="h-3 w-3" />#{index + 1}
                        </Badge>
                        {business.featured && (
                          <Badge className="bg-accent text-accent-foreground">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <img
                        src={business.images[0] || "/placeholder.svg"}
                        alt={business.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="p-5">
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span className="font-semibold">{business.rating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({business.reviewCount} reviews)
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                          {business.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {getCategoryName(business.category)}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {business.description}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {business.address.city}, {business.address.state}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Category Trends */}
          <section className="py-12 bg-muted/50">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                Trending Categories
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {CATEGORIES.slice(0, 8).map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    className="px-4 py-2 bg-card border border-border rounded-full text-sm hover:border-primary hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <TrendingUp className="h-3 w-3" />
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TrendingPage;
