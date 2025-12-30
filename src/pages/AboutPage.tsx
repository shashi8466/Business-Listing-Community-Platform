import { Helmet } from "react-helmet-async";
import { Users, Target, Heart, Award } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us - d4desi</title>
        <meta name="description" content="Learn about d4desi - the community-driven marketplace connecting Desi businesses with customers across the United States." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-hero py-20 text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">About d4desi</h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Connecting the Desi community across America
              </p>
            </div>
          </section>

          {/* Mission */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
                <p className="text-lg text-muted-foreground">
                  d4desi is a comprehensive, community-driven marketplace platform designed for Desi communities across the United States. We bridge the gap between trusted Desi businesses, service providers, and community members seeking reliable local services.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-card border border-border rounded-xl p-8">
                  <Target className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-3">Our Vision</h3>
                  <p className="text-muted-foreground">
                    To be the #1 destination for discovering and connecting with Desi businesses and services in every major U.S. city, fostering a stronger, more connected community.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-8">
                  <Heart className="h-12 w-12 text-secondary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-3">Our Values</h3>
                  <p className="text-muted-foreground">
                    Trust, community, and cultural pride drive everything we do. We believe in supporting Desi entrepreneurs and making it easy for our community to find quality services.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-16 bg-muted/50">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                  <p className="text-muted-foreground">Businesses Listed</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">50+</div>
                  <p className="text-muted-foreground">Cities Covered</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">100,000+</div>
                  <p className="text-muted-foreground">Community Members</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">5M+</div>
                  <p className="text-muted-foreground">Monthly Visitors</p>
                </div>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Story</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Founded in 2024, d4desi was born from a simple idea: make it easier for the Desi community to find and support local businesses. What started as a small directory has grown into a thriving marketplace connecting thousands of businesses with customers every day.
              </p>
              <p className="text-lg text-muted-foreground">
                Our team is passionate about serving the Desi community and empowering entrepreneurs to grow their businesses. We're committed to building a platform that reflects our culture, values, and aspirations.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AboutPage;
