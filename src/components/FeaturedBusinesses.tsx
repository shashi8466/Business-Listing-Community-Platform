import { Star, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const businesses = [
  {
    name: "Spice Symphony",
    category: "Indian Restaurant",
    location: "New York, NY",
    rating: 4.8,
    reviews: 245,
    featured: true,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop",
  },
  {
    name: "Sharma Real Estate",
    category: "Real Estate",
    location: "Los Angeles, CA",
    rating: 4.9,
    reviews: 182,
    featured: true,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
  },
  {
    name: "Vedic Tutors Academy",
    category: "Education & Tutoring",
    location: "Houston, TX",
    rating: 4.7,
    reviews: 156,
    featured: false,
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop",
  },
  {
    name: "Patel Immigration Law",
    category: "Legal Services",
    location: "San Francisco, CA",
    rating: 4.9,
    reviews: 198,
    featured: true,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop",
  },
];

const FeaturedBusinesses = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Businesses
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Top-rated Desi businesses trusted by our community
            </p>
          </div>
          <Button variant="outline" className="gap-2 w-fit">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {businesses.map((business) => (
            <a
              key={business.name}
              href="#"
              className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={business.image}
                  alt={business.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                  <span className="font-semibold text-foreground">{business.rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({business.reviews} reviews)
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors mb-1">
                  {business.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{business.category}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {business.location}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBusinesses;
