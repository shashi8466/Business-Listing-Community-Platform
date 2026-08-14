import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Users, MapPin, Sparkles, TrendingUp, Plus, ArrowRight, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCommunities } from "@/hooks/useCommunities";
import { useAuth } from "@/contexts/AuthContext";
import { US_CITIES } from "@/types";
import { INTEREST_CATEGORIES } from "@/types/community";

const CommunitiesPage = ({ hideLayout = false }: { hideLayout?: boolean }) => {
  const { user } = useAuth();
  const { communities: recentCommunities, loading: recentLoading } = useCommunities({ sort: 'recent', limit: 2 });
  const { communities: featuredCommunities, loading: featuredLoading } = useCommunities({ featured: true, limit: 6 });
  const { communities: cityCommunities, loading: cityLoading } = useCommunities({ type: 'city', limit: 8 });
  const { communities: interestCommunities, loading: interestLoading } = useCommunities({ type: 'interest', limit: 8 });

  return (
    <>
      <Helmet>
        <title>Desi Communities - Connect with Your Community | BusinessHub</title>
        <meta
          name="description"
          content="Join Desi communities across the United States. Connect with people in your city or by interests like students, professionals, parents, and more."
        />
        <link rel="canonical" href="https://BusinessHub.com/communities" />
      </Helmet>

      <div className={hideLayout ? "" : "min-h-screen flex flex-col bg-background"}>
        {!hideLayout && <Header />}

        <main className={hideLayout ? "" : "flex-1"}>
          {/* Hero */}
          <section className="bg-gradient-hero py-16 text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full mb-6">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">Community Platform</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Connect with Your Desi Community
              </h1>
              <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
                Join city-based and interest-based communities. Share experiences,
                discuss topics, attend events, and grow together.
              </p>
              {user ? (
                <Button size="lg" variant="secondary" className="gap-2" asChild>
                  <Link to="/communities/create">
                    <Plus className="h-5 w-5" />
                    Create Community
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/auth">Join the Community</Link>
                </Button>
              )}
            </div>
          </section>

          {/* Recently Created */}
          <section className="py-12 bg-muted/20">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Recently Created
                  </h2>
                </div>
              </div>

              {recentLoading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-xl h-64 animate-pulse" />
                  ))}
                </div>
              ) : recentCommunities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No recent communities</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {recentCommunities.map((community) => (
                    <Link
                      key={community.id}
                      to={`/community/${community.slug}`}
                      className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all flex flex-col"
                    >
                      <div className="h-40 bg-orange-100 flex items-center justify-center relative">
                        <Badge className="absolute top-4 right-4 bg-primary hover:bg-primary text-white">New</Badge>
                        <Users className="h-16 w-16 text-primary/60" />
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          {community.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {community.type === 'city' ? community.city : community.interest || 'testing'}
                        </p>
                        <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {community.member_count || 1} members
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(community.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Featured Communities */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Featured Communities
                  </h2>
                </div>
              </div>

              {featuredLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                      <div className="h-12 w-12 bg-muted rounded-full mb-4" />
                      <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-full mb-4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : featuredCommunities.length === 0 ? (
                <div className="text-center py-12 bg-muted/50 rounded-xl">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No featured communities yet</p>
                  <Button asChild>
                    <Link to="/communities/create">Create the First Community</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredCommunities.map((community) => (
                    <Link
                      key={community.id}
                      to={`/community/${community.slug}`}
                      className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                          {community.type === 'city' ? '🏙️' : '👥'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {community.name}
                            </h3>
                            <Badge variant="secondary" className="flex-shrink-0">Featured</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {community.member_count} members
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {community.description || `Join the ${community.name} community`}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* City Communities */}
          <section className="py-12 bg-muted/50">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Communities by City
                  </h2>
                </div>
                <Button variant="outline" className="gap-2" asChild>
                  <Link to="/communities/cities">
                    View All Cities <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* City Quick Links */}
              <div className="flex flex-wrap gap-3 mb-8">
                {US_CITIES.slice(0, 12).map((city) => (
                  <Link
                    key={city.city}
                    to={`/communities/city/${city.city.toLowerCase().replace(/\s+/g, '-')}`}
                    className="px-4 py-2 bg-card border border-border rounded-full text-sm hover:border-primary hover:text-primary transition-colors"
                  >
                    {city.city}, {city.state}
                  </Link>
                ))}
              </div>

              {/* City Community Cards */}
              {cityCommunities.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cityCommunities.map((community) => (
                    <Link
                      key={community.id}
                      to={`/community/${community.slug}`}
                      className="bg-card border border-border rounded-lg p-4 hover:shadow-md hover:border-primary/50 transition-all"
                    >
                      <h3 className="font-medium text-foreground mb-1">{community.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {community.member_count} members
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Interest Communities */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Communities by Interest
                  </h2>
                </div>
                <Button variant="outline" className="gap-2" asChild>
                  <Link to="/communities/interests">
                    View All Interests <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Interest Category Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {INTEREST_CATEGORIES.map((interest) => (
                  <Link
                    key={interest.id}
                    to={`/communities/interests/${interest.id}`}
                    className="group p-4 bg-card border border-border rounded-xl text-center hover:border-primary hover:shadow-md transition-all"
                  >
                    <div className="text-3xl mb-2">{interest.icon}</div>
                    <h3 className="font-medium text-foreground group-hover:text-primary text-sm">
                      {interest.name}
                    </h3>
                  </Link>
                ))}
              </div>

              {/* Interest Community Cards */}
              {interestCommunities.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {interestCommunities.map((community) => (
                    <Link
                      key={community.id}
                      to={`/community/${community.slug}`}
                      className="bg-card border border-border rounded-lg p-4 hover:shadow-md hover:border-primary/50 transition-all"
                    >
                      <h3 className="font-medium text-foreground mb-1">{community.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {community.member_count} members
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-gradient-hero text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Don't See Your Community?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                Create a new community and bring people together around shared
                interests, locations, or causes.
              </p>
              <Button size="lg" variant="secondary" className="gap-2" asChild>
                <Link to={user ? "/communities/create" : "/auth"}>
                  <Plus className="h-5 w-5" />
                  {user ? "Create Community" : "Sign Up to Create"}
                </Link>
              </Button>
            </div>
          </section>
        </main>

        {!hideLayout && <Footer />}
      </div>
    </>
  );
};

export default CommunitiesPage;
