import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useBusinesses } from "@/hooks/useBusinesses";
import { CATEGORIES, US_CITIES } from "@/types";

const CityPage = () => {
  const { cityName } = useParams<{ cityName: string }>();
  
  const city = US_CITIES.find(c => c.city.toLowerCase().replace(/\s+/g, '-') === cityName?.toLowerCase());
  const { businesses, loading } = useBusinesses({ city: city?.city, limitCount: 9 });

  if (!city) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">City Not Found</h1>
            <Link to="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Desi Businesses in {city.city}, {city.state} | d4desi</title>
        <meta name="description" content={`Find trusted Desi businesses and services in ${city.city}, ${city.state}. Browse restaurants, tutors, real estate, and more.`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-hero py-16 text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Desi in {city.city}, {city.state}
              </h1>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Discover the best Desi businesses and services in your city
              </p>
            </div>
          </section>

          {/* Categories */}
          <section className="py-12 bg-muted/50">
            <div className="container mx-auto px-4">
              <h2 className="text-xl font-semibold text-foreground mb-6">Browse by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {CATEGORIES.slice(0, 5).map(cat => (
                  <Link
                    key={cat.id}
                    to={`/search?category=${cat.id}&city=${city.city}`}
                    className="px-4 py-3 bg-card border border-border rounded-lg text-center text-sm hover:border-primary hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Listings */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  Featured in {city.city}
                </h2>
                <Link to={`/search?city=${city.city}`}>
                  <Button variant="outline" className="gap-2">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
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
                  <p className="text-muted-foreground mb-4">No businesses listed in {city.city} yet</p>
                  <Link to="/list-business">
                    <Button>List Your Business</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businesses.map(business => (
                    <Link
                      key={business.id}
                      to={`/business/${business.id}`}
                      className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all"
                    >
                      <img src={business.images[0] || "/placeholder.svg"} alt={business.name} className="w-full h-48 object-cover" />
                      <div className="p-5">
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span className="font-semibold">{business.rating}</span>
                          <span className="text-sm text-muted-foreground">({business.reviewCount})</span>
                        </div>
                        <h3 className="font-semibold text-lg text-foreground mb-1">{business.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{business.description}</p>
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
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CityPage;
