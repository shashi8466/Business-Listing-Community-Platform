import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Star, MapPin, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useBusinesses } from "@/hooks/useBusinesses";
import { CATEGORIES } from "@/types";

const FeaturedPage = () => {
  const { businesses, loading } = useBusinesses({ featured: true });

  const getCategoryName = (id: string) =>
    CATEGORIES.find((c) => c.id === id)?.name || id;

  return (
    <>
      <Helmet>
        <title>Featured Businesses - Top Rated Desi Services | BusinessHub</title>
        <meta
          name="description"
          content="Discover our handpicked selection of top-rated Desi businesses and services across the United States. Featured listings represent the best in quality and service."
        />
        <link rel="canonical" href="https://BusinessHub.com/featured" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-hero py-16 text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full mb-6">
                <Award className="h-5 w-5" />
                <span className="text-sm font-medium">Handpicked Excellence</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Featured Businesses
              </h1>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Discover our curated selection of top-rated Desi businesses known for
                exceptional quality, outstanding reviews, and trusted service.
              </p>
            </div>
          </section>

          {/* Featured Listings */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  {loading ? "Loading..." : `${businesses.length} Featured Listings`}
                </h2>
                <Link to="/search">
                  <Button variant="outline" className="gap-2">
                    View All Businesses <ArrowRight className="h-4 w-4" />
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
              ) : businesses.length === 0 ? (
                <div className="text-center py-12 bg-muted/50 rounded-xl">
                  <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg mb-4">
                    No featured businesses yet
                  </p>
                  <Link to="/search">
                    <Button>Browse All Businesses</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businesses.map((business) => (
                    <Link
                      key={business.id}
                      to={`/business/${business.id}`}
                      className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all relative"
                    >
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-accent text-accent-foreground gap-1">
                          <Award className="h-3 w-3" />
                          Featured
                        </Badge>
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

          {/* CTA */}
          <section className="py-12 bg-muted/50">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Want to Get Featured?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Stand out from the crowd. Featured listings get priority placement and
                increased visibility to potential customers.
              </p>
              <Link to="/list-business">
                <Button size="lg">List Your Business</Button>
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FeaturedPage;
