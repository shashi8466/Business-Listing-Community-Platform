import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFavorites } from "@/hooks/useFavorites";
import { Heart, Star, MapPin, Trash2 } from "lucide-react";

const FavoritesPage = () => {
  const { user, loading, toggleFavorite } = useAuth();
  const { favorites, loading: favLoading, refetch } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleRemoveFavorite = async (businessId: string) => {
    await toggleFavorite(businessId);
    refetch();
  };

  if (loading || favLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Helmet>
        <title>Saved Listings - BusinessHub</title>
        <meta name="description" content="Your saved businesses and services on BusinessHub" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Saved Listings</h1>
                <p className="text-muted-foreground">
                  {favorites.length} {favorites.length === 1 ? "business" : "businesses"} saved
                </p>
              </div>
            </div>

            {favorites.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">No saved listings</h2>
                  <p className="text-muted-foreground text-center mb-6">
                    Start exploring and save businesses you're interested in
                  </p>
                  <Link to="/search">
                    <Button>Browse Businesses</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {favorites.map((business) => (
                  <Card key={business.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <Link to={`/business/${business.id}`} className="md:w-48 shrink-0">
                          <img
                            src={business.images?.[0] || "/placeholder.svg"}
                            alt={business.name}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </Link>
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-2">
                            <Link to={`/business/${business.id}`}>
                              <h2 className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
                                {business.name}
                              </h2>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFavorite(business.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                          
                          <p className="text-sm text-primary font-medium mb-2">
                            {business.category}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {business.address?.city}, {business.address?.state}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-accent text-accent" />
                              {business.rating?.toFixed(1) || "N/A"}
                              <span>({business.reviewCount || 0} reviews)</span>
                            </div>
                          </div>

                          <p className="text-muted-foreground line-clamp-2 mb-4">
                            {business.description}
                          </p>

                          <div className="flex gap-3">
                            <Link to={`/business/${business.id}`}>
                              <Button variant="outline" size="sm">View Details</Button>
                            </Link>
                            {business.phone && (
                              <Button size="sm" asChild>
                                <a href={`tel:${business.phone}`}>Call Now</a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FavoritesPage;
