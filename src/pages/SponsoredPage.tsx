import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Star, MapPin, Crown, ArrowRight, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useBusinesses } from "@/hooks/useBusinesses";
import { CATEGORIES } from "@/types";

const SponsoredPage = () => {
  // For now, show featured businesses as sponsored (future: add sponsored flag)
  const { businesses, loading } = useBusinesses({ featured: true });

  const getCategoryName = (id: string) =>
    CATEGORIES.find((c) => c.id === id)?.name || id;

  return (
    <>
      <Helmet>
        <title>Sponsored Listings - Premium Business Promotion | d4desi</title>
        <meta
          name="description"
          content="Premium sponsored listings for maximum visibility. Get priority placement and reach more customers with d4desi's sponsored business program."
        />
        <link rel="canonical" href="https://d4desi.com/sponsored" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-hero py-16 text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full mb-6">
                <Crown className="h-5 w-5" />
                <span className="text-sm font-medium">Premium Visibility</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Sponsored Listings
              </h1>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Premium businesses with priority placement for maximum visibility
                and customer reach.
              </p>
            </div>
          </section>

          {/* Sponsored Benefits */}
          <section className="py-12 bg-muted/50 border-b border-border">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
                Why Choose Sponsored Listings?
              </h2>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <Card>
                  <CardHeader className="text-center">
                    <Zap className="h-10 w-10 text-primary mx-auto mb-2" />
                    <CardTitle className="text-lg">Priority Placement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      Appear at the top of search results and category pages for
                      maximum exposure.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="text-center">
                    <Crown className="h-10 w-10 text-primary mx-auto mb-2" />
                    <CardTitle className="text-lg">Premium Badge</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      Stand out with a distinctive sponsored badge that builds trust
                      with customers.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="text-center">
                    <Clock className="h-10 w-10 text-primary mx-auto mb-2" />
                    <CardTitle className="text-lg">Extended Visibility</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      Featured across the platform for the duration of your
                      sponsorship period.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Sponsored Listings */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  {loading ? "Loading..." : `${businesses.length} Sponsored Listings`}
                </h2>
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
              ) : businesses.length === 0 ? (
                <div className="text-center py-12 bg-muted/50 rounded-xl">
                  <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg mb-4">
                    No sponsored listings available yet
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Coming soon! Contact us to learn about sponsorship opportunities.
                  </p>
                  <Link to="/contact">
                    <Button>Contact Us</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businesses.map((business) => (
                    <Link
                      key={business.id}
                      to={`/business/${business.id}`}
                      className="group bg-card border-2 border-primary/20 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all relative"
                    >
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-primary text-primary-foreground gap-1">
                          <Crown className="h-3 w-3" />
                          Sponsored
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
          <section className="py-16 bg-gradient-hero text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <Crown className="h-12 w-12 mx-auto mb-4 opacity-80" />
              <h2 className="text-3xl font-bold mb-4">
                Ready to Boost Your Business?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                Sponsorship program coming soon! Be among the first to get priority
                placement and maximum visibility.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" variant="secondary">
                    Contact for Early Access
                  </Button>
                </Link>
                <Link to="/list-business">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    List Your Business Free
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SponsoredPage;
