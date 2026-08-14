import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Building2, Store, Edit, Trash2, MapPin, Star, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useMyBusinesses } from "@/hooks/useMyBusinesses";
import { CATEGORIES } from "@/types";
import { useToast } from "@/hooks/use-toast";

const AdminMyBusinessesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { businesses, loading, deleteBusiness } = useMyBusinesses(user?.id);

  const getCategoryName = (id: string) =>
    CATEGORIES.find((c) => c.id === id)?.name || id;

  const handleDeleteBusiness = async (businessId: string) => {
    try {
      await deleteBusiness(businessId);
      toast({
        title: "Business Deleted",
        description: "Your listing has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete business.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>My Businesses | Admin | BusinessHub</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            My Businesses
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal business listings
          </p>
        </div>
        <Link to="/list-business">
          <Button className="gap-2">
            <Building2 className="h-4 w-4" />
            Add New
          </Button>
        </Link>
      </div>

      <div>
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse flex gap-4">
                <div className="w-24 h-24 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              You haven't listed any businesses yet
            </p>
            <Link to="/list-business">
              <Button>List Your Business</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {businesses.map((business) => (
              <div key={business.id} className="bg-card border border-border rounded-xl p-4 flex gap-4">
                <img
                  src={business.images[0] || "/placeholder.svg"}
                  alt={business.name}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">
                      {getCategoryName(business.category)}
                    </Badge>
                    {business.approved ? (
                      <Badge variant="outline" className="text-primary border-primary gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-600 gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  <Link
                    to={`/business/${business.id}`}
                    className="font-semibold text-lg text-foreground hover:text-primary transition-colors"
                  >
                    {business.name}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    {business.rating} ({business.reviewCount} reviews)
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    {business.address.city}, {business.address.state}
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[120px]">
                  <Link to={`/business/${business.id}/edit`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Link to={`/business/${business.id}`}>
                    <Button variant="ghost" size="sm" className="w-full">
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBusiness(business.id)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminMyBusinessesPage;
