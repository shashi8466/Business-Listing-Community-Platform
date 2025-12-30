import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { US_CITIES } from "@/types";

const CommunitiesCitiesPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Communities by City | d4desi</title>
        <meta
          name="description"
          content="Find Desi communities in your city. Connect with locals across the United States."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-3 mb-8">
              <MapPin className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Communities by City
              </h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {US_CITIES.map((city) => (
                <Link
                  key={city.city}
                  to={`/communities/city/${city.city.toLowerCase().replace(/\s+/g, "-")}`}
                  className="p-4 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all text-center"
                >
                  <h3 className="font-medium text-foreground">{city.city}</h3>
                  <p className="text-sm text-muted-foreground">{city.state}</p>
                </Link>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CommunitiesCitiesPage;
