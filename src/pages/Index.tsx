import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import CitiesSection from "@/components/CitiesSection";
import FeaturedBusinesses from "@/components/FeaturedBusinesses";
import CommunitySection from "@/components/CommunitySection";
import BusinessCTA from "@/components/BusinessCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>d4desi - Discover Trusted Desi Businesses & Services in the USA</title>
        <meta
          name="description"
          content="Find trusted Indian businesses, restaurants, tutors, real estate agents, and more. Connect with the Desi community across the United States."
        />
        <meta
          name="keywords"
          content="desi businesses, indian restaurants, indian tutors, desi community, indian services USA, south asian businesses"
        />
        <link rel="canonical" href="https://d4desi.com" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "d4desi",
            url: "https://d4desi.com",
            description:
              "Community-driven marketplace for Desi businesses and services in the USA",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://d4desi.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <CategoriesSection />
          <FeaturedBusinesses />
          <CitiesSection />
          <CommunitySection />
          <BusinessCTA />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
