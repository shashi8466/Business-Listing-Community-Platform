import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const cities = [
  { name: "New York", state: "NY", count: "2,500+" },
  { name: "Los Angeles", state: "CA", count: "2,100+" },
  { name: "Chicago", state: "IL", count: "1,400+" },
  { name: "Houston", state: "TX", count: "1,800+" },
  { name: "San Francisco", state: "CA", count: "1,200+" },
  { name: "Dallas", state: "TX", count: "1,100+" },
  { name: "Atlanta", state: "GA", count: "900+" },
  { name: "Seattle", state: "WA", count: "750+" },
  { name: "Boston", state: "MA", count: "680+" },
  { name: "Phoenix", state: "AZ", count: "620+" },
  { name: "Washington", state: "DC", count: "850+" },
  { name: "Denver", state: "CO", count: "520+" },
];

const CitiesSection = () => {
  return (
    <section id="cities" className="py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Find Services in Your City
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with trusted Desi businesses and services in major cities across the USA
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {cities.map((city) => (
            <a
              key={city.name}
              href="#"
              className="group bg-card p-5 rounded-xl border border-border hover:border-primary hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {city.name}, {city.state}
                  </h3>
                  <p className="text-sm text-muted-foreground">{city.count} businesses</p>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg" className="gap-2">
            View All Cities
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CitiesSection;
