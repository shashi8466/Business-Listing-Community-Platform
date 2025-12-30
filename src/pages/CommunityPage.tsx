import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Users,
  MessageSquare,
  Calendar,
  Settings,
  Shield,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCommunity } from "@/hooks/useCommunities";
import { useDiscussions } from "@/hooks/useDiscussions";
import { useCommunityEvents } from "@/hooks/useCommunityEvents";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import CommunityDiscussions from "@/components/community/CommunityDiscussions";
import CommunityEvents from "@/components/community/CommunityEvents";
import CommunityMembers from "@/components/community/CommunityMembers";

const CommunityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { community, membership, loading, error, joinCommunity, leaveCommunity } = useCommunity(slug);
  const { discussions, createDiscussion } = useDiscussions(community?.id);
  const { events, createEvent } = useCommunityEvents(community?.id);

  const handleJoin = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to join communities.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await joinCommunity();
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else {
      toast({ title: "Joined!", description: `You're now a member of ${community?.name}` });
    }
  };

  const handleLeave = async () => {
    const { error } = await leaveCommunity();
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else {
      toast({ title: "Left community", description: "You've left this community" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading community...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Community Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "This community doesn't exist."}</p>
            <Link to="/communities">
              <Button>Browse Communities</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isAdmin = membership?.role === 'admin';
  const isModerator = membership?.role === 'moderator' || isAdmin;

  return (
    <>
      <Helmet>
        <title>{community.name} - Desi Community | d4desi</title>
        <meta
          name="description"
          content={community.description || `Join ${community.name} community on d4desi`}
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Cover Image */}
          <div
            className="h-48 md:h-64 bg-gradient-hero"
            style={
              community.cover_image_url
                ? { backgroundImage: `url(${community.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : {}
            }
          />

          {/* Community Header */}
          <div className="container mx-auto px-4">
            <div className="relative -mt-16 mb-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Community Avatar */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-card border-4 border-background flex items-center justify-center text-4xl shadow-lg">
                  {community.image_url ? (
                    <img
                      src={community.image_url}
                      alt={community.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    community.type === 'city' ? '🏙️' : '👥'
                  )}
                </div>

                {/* Community Info */}
                <div className="flex-1 pt-4 md:pt-8">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {community.name}
                    </h1>
                    {community.is_featured && (
                      <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                    )}
                    <Badge variant="secondary">
                      {community.type === 'city' ? community.city : community.interest}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4 max-w-2xl">
                    {community.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {community.member_count} members
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {discussions.length} discussions
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {events.length} events
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 md:pt-8">
                  {membership ? (
                    <>
                      <Button variant="outline" onClick={handleLeave}>
                        Leave
                      </Button>
                      {isModerator && (
                        <Link to={`/community/${slug}/admin`}>
                          <Button variant="outline" className="gap-2">
                            <Shield className="h-4 w-4" />
                            Moderate
                          </Button>
                        </Link>
                      )}
                      {isAdmin && (
                        <Link to={`/community/${slug}/settings`}>
                          <Button variant="outline" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                          </Button>
                        </Link>
                      )}
                    </>
                  ) : (
                    <Button onClick={handleJoin} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Join Community
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="discussions" className="pb-12">
              <TabsList className="mb-6">
                <TabsTrigger value="discussions" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Discussions
                </TabsTrigger>
                <TabsTrigger value="events" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Events
                </TabsTrigger>
                <TabsTrigger value="members" className="gap-2">
                  <Users className="h-4 w-4" />
                  Members
                </TabsTrigger>
              </TabsList>

              <TabsContent value="discussions">
                <CommunityDiscussions
                  communityId={community.id}
                  communitySlug={community.slug}
                  discussions={discussions}
                  isMember={!!membership}
                  onCreateDiscussion={createDiscussion}
                />
              </TabsContent>

              <TabsContent value="events">
                <CommunityEvents
                  communityId={community.id}
                  events={events}
                  isMember={!!membership}
                  onCreateEvent={createEvent}
                />
              </TabsContent>

              <TabsContent value="members">
                <CommunityMembers communityId={community.id} />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CommunityPage;
