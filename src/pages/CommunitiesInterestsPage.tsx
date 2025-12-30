import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { INTEREST_CATEGORIES } from "@/types/community";

const CommunitiesInterestsPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Communities by Interest | d4desi</title>
        <meta
          name="description"
          content="Find Desi communities by interest. Connect with people who share your passions."
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
              <TrendingUp className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Communities by Interest
              </h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {INTEREST_CATEGORIES.map((interest) => (
                <Link
                  key={interest.id}
                  to={`/communities/interests/${interest.id}`}
                  className="p-6 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all text-center group"
                >
                  <div className="text-4xl mb-3">{interest.icon}</div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {interest.name}
                  </h3>
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

export default CommunitiesInterestsPage;
