import { Users, MessageSquare, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const communities = [
  {
    name: "Desi Parents NYC",
    members: "12,500",
    posts: "450+",
    type: "Parents & Family",
  },
  {
    name: "Bay Area Tech Desis",
    members: "18,200",
    posts: "890+",
    type: "Professional",
  },
  {
    name: "Houston Hindu Temple",
    members: "8,400",
    posts: "320+",
    type: "Religious",
  },
  {
    name: "Chicago Desi Foodies",
    members: "15,600",
    posts: "720+",
    type: "Lifestyle",
  },
];

const CommunitySection = () => {
  return (
    <section id="community" className="py-16 md:py-24 bg-gradient-hero text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Our Thriving Community
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Connect with Desi communities based on your city, interests, and culture
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {communities.map((community) => (
            <div
              key={community.name}
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wide opacity-75">
                    {community.type}
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-3">{community.name}</h3>
              <div className="flex items-center gap-4 text-sm opacity-90">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {community.members}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {community.posts}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            variant="secondary"
            className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 gap-2"
            asChild
          >
            <Link to="/communities">
              Explore All Communities
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 pt-12 border-t border-primary-foreground/20">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-semibold text-xl mb-2">City-based Groups</h3>
            <p className="opacity-90">
              Find and connect with Desi communities in your city
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-semibold text-xl mb-2">Discussion Forums</h3>
            <p className="opacity-90">
              Engage in meaningful conversations on topics that matter
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-semibold text-xl mb-2">Local Events</h3>
            <p className="opacity-90">
              Stay updated on cultural events and gatherings near you
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
