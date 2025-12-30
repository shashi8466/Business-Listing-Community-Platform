import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORIES, US_CITIES, Business } from "@/types";

const sampleBusinesses: Business[] = [
  {
    id: "1", ownerId: "o1", name: "Spice Symphony", slug: "spice-symphony",
    description: "Authentic North Indian cuisine", category: "restaurants",
    address: { street: "123 Main St", city: "New York", state: "NY", zipCode: "10001" },
    phone: "(212) 555-0123", email: "info@spice.com",
    images: ["https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop"],
    rating: 4.8, reviewCount: 245, featured: true, verified: true,
    services: ["Dine-in"], hours: {}, createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "4", ownerId: "o4", name: "Patel Immigration Law", slug: "patel-law",
    description: "Immigration attorneys", category: "legal",
    address: { street: "321 Pine St", city: "New York", state: "NY", zipCode: "10002" },
    phone: "(212) 555-0321", email: "info@patel.com",
    images: ["https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop"],
    rating: 4.9, reviewCount: 198, featured: true, verified: true,
    services: ["H1B", "Green Card"], hours: {}, createdAt: new Date(), updatedAt: new Date()
  },
];

const CityPage = () => {
  const { cityName } = useParams<{ cityName: string }>();
  
  const city = US_CITIES.find(c => c.city.toLowerCase().replace(/\s+/g, '-') === cityName?.toLowerCase());
  const businesses = sampleBusinesses.filter(b => 
    city && b.address.city.toLowerCase() === city.city.toLowerCase()
  );

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

              {businesses.length === 0 ? (
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
                      <img src={business.images[0]} alt={business.name} className="w-full h-48 object-cover" />
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
