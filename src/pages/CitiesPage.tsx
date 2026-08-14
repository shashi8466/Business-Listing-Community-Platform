import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { US_CITIES } from "@/types";

const CitiesPage = () => {
  return (
    <>
      <Helmet>
        <title>Browse by City - BusinessHub</title>
        <meta
          name="description"
          content="Find Desi businesses and services in cities across the United States"
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Find Services in Your City
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Browse trusted Desi businesses and services across major cities in the USA
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
              {US_CITIES.map((city) => (
                <Link
                  key={city.city}
                  to={`/search?city=${encodeURIComponent(city.city)}`}
                  className="group bg-card p-5 rounded-xl border border-border hover:border-primary hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {city.city}, {city.state}
                      </h3>
                      <p className="text-sm text-muted-foreground">Browse businesses</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                <Search className="h-4 w-4" />
                Search all businesses
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CitiesPage;
