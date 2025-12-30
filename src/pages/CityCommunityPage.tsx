import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin, ArrowLeft, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCommunities } from "@/hooks/useCommunities";
import { useAuth } from "@/contexts/AuthContext";
import { US_CITIES } from "@/types";

const CityCommunityPage = () => {
  const { citySlug } = useParams();
  const { user } = useAuth();
  
  const cityName = citySlug?.replace(/-/g, " ") || "";
  const cityInfo = US_CITIES.find(
    (c) => c.city.toLowerCase() === cityName.toLowerCase()
  );

  const { communities, loading } = useCommunities({ 
    type: "city", 
    city: cityInfo?.city 
  });

  return (
    <>
      <Helmet>
        <title>{cityInfo?.city || cityName} Desi Communities | d4desi</title>
        <meta
          name="description"
          content={`Find Desi communities in ${cityInfo?.city || cityName}. Connect with locals and join discussions.`}
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <Link to="/communities/cities">
              <Button variant="ghost" className="mb-6 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Cities
              </Button>
            </Link>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <MapPin className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {cityInfo?.city || cityName}
                  </h1>
                  {cityInfo && (
                    <p className="text-muted-foreground">{cityInfo.state}</p>
                  )}
                </div>
              </div>
              {user && (
                <Link to="/communities/create">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Community
                  </Button>
                </Link>
              )}
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-full mb-4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : communities.length === 0 ? (
              <div className="text-center py-16 bg-muted/50 rounded-xl">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  No communities yet
                </h2>
                <p className="text-muted-foreground mb-6">
                  Be the first to create a community in {cityInfo?.city || cityName}!
                </p>
                <Link to={user ? "/communities/create" : "/auth"}>
                  <Button>{user ? "Create Community" : "Sign Up to Create"}</Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community) => (
                  <Link
                    key={community.id}
                    to={`/community/${community.slug}`}
                    className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all"
                  >
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      {community.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {community.description || `Join the ${community.name} community`}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {community.member_count} members
                    </p>
                  </Link>
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

export default CityCommunityPage;
