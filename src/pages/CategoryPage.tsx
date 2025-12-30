import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CATEGORIES, US_CITIES, Business } from "@/types";

// Sample businesses
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
    id: "2", ownerId: "o2", name: "Chennai Kitchen", slug: "chennai-kitchen",
    description: "South Indian vegetarian cuisine", category: "restaurants",
    address: { street: "456 Oak Ave", city: "Chicago", state: "IL", zipCode: "60601" },
    phone: "(312) 555-0456", email: "info@chennai.com",
    images: ["https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop"],
    rating: 4.6, reviewCount: 312, featured: false, verified: true,
    services: ["Dine-in", "Takeout"], hours: {}, createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: "3", ownerId: "o3", name: "Vedic Tutors Academy", slug: "vedic-tutors",
    description: "Expert tutoring in Math, Science, SAT/ACT prep", category: "tutors",
    address: { street: "789 Elm St", city: "Houston", state: "TX", zipCode: "77001" },
    phone: "(713) 555-0789", email: "info@vedic.com",
    images: ["https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop"],
    rating: 4.7, reviewCount: 156, featured: false, verified: true,
    services: ["Math", "Science"], hours: {}, createdAt: new Date(), updatedAt: new Date()
  },
];

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  
  const category = CATEGORIES.find(c => c.id === categoryId);
  const businesses = sampleBusinesses.filter(b => b.category === categoryId);

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
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
        <title>{category.name} - Desi Businesses | d4desi</title>
        <meta name="description" content={`Find trusted Desi ${category.name.toLowerCase()} across the United States. Browse ratings, reviews, and contact info.`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-hero py-16 text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Discover trusted Desi {category.name.toLowerCase()} across the United States
              </p>
            </div>
          </section>

          {/* Cities */}
          <section className="py-12 bg-muted/50">
            <div className="container mx-auto px-4">
              <h2 className="text-xl font-semibold text-foreground mb-6">Browse by City</h2>
              <div className="flex flex-wrap gap-3">
                {US_CITIES.slice(0, 8).map(city => (
                  <Link
                    key={city.city}
                    to={`/search?category=${categoryId}&city=${city.city}`}
                    className="px-4 py-2 bg-card border border-border rounded-full text-sm hover:border-primary hover:text-primary transition-colors"
                  >
                    {city.city}, {city.state}
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
                  Featured {category.name}
                </h2>
                <Link to={`/search?category=${categoryId}`}>
                  <Button variant="outline" className="gap-2">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {businesses.length === 0 ? (
                <div className="text-center py-12 bg-muted/50 rounded-xl">
                  <p className="text-muted-foreground mb-4">No businesses in this category yet</p>
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
                      <img
                        src={business.images[0]}
                        alt={business.name}
                        className="w-full h-48 object-cover"
                      />
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

export default CategoryPage;
