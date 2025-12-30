import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  User,
  Heart,
  Star,
  LogOut,
  MapPin,
  Building2,
  MessageSquare,
  Edit,
  Trash2,
  Store,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import { useUserReviews } from "@/hooks/useUserReviews";
import { useMyBusinesses } from "@/hooks/useMyBusinesses";
import { CATEGORIES } from "@/types";

const DashboardPage = () => {
  const { user, userProfile, signOut, loading, updateUserProfile, toggleFavorite } = useAuth();
  const { toast } = useToast();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const { reviews, loading: reviewsLoading, deleteReview } = useUserReviews(user?.uid);
  const { businesses: myBusinesses, loading: businessesLoading, deleteBusiness } = useMyBusinesses(user?.uid);

  const getCategoryName = (id: string) =>
    CATEGORIES.find((c) => c.id === id)?.name || id;
  
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    phone: "",
  });

  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        displayName: userProfile.displayName || "",
        phone: userProfile.phone || "",
      });
    }
  }, [userProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({
        displayName: profileForm.displayName,
        phone: profileForm.phone,
      });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveSaved = async (businessId: string) => {
    try {
      await toggleFavorite(businessId);
      toast({
        title: "Removed",
        description: "Business removed from your saved list.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove business.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReview = async (reviewId: string, businessId: string) => {
    try {
      await deleteReview(reviewId, businessId);
      toast({
        title: "Review Deleted",
        description: "Your review has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review.",
        variant: "destructive",
      });
    }
  };

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
        <title>My Dashboard - d4desi</title>
        <meta name="description" content="Manage your d4desi account, saved businesses, and reviews" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="font-semibold text-foreground text-lg">
                      {userProfile?.displayName || user.email}
                    </h2>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <Badge variant="secondary" className="mt-2">
                      {userProfile?.role === 'business' ? 'Business Owner' : 'Member'}
                    </Badge>
                  </div>

                  <nav className="space-y-1">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                        activeTab === "profile"
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => setActiveTab("saved")}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                        activeTab === "saved"
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Heart className="h-4 w-4" />
                      Saved Businesses
                    </button>
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                        activeTab === "reviews"
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Star className="h-4 w-4" />
                      My Reviews
                    </button>
                    <button
                      onClick={() => setActiveTab("listings")}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                        activeTab === "listings"
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Store className="h-4 w-4" />
                      My Listings
                    </button>
                    <button
                      onClick={() => setActiveTab("inquiries")}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                        activeTab === "inquiries"
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <MessageSquare className="h-4 w-4" />
                      My Inquiries
                    </button>
                  </nav>

                  <div className="mt-6 pt-6 border-t border-border">
                    <Link to="/list-business">
                      <Button variant="outline" className="w-full gap-2 mb-3">
                        <Building2 className="h-4 w-4" />
                        List Your Business
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full gap-2 text-destructive hover:text-destructive"
                      onClick={signOut}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {activeTab === "profile" && (
                  <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
                      {!isEditing && (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email || ""}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="displayName">Full Name</Label>
                        <Input
                          id="displayName"
                          value={profileForm.displayName}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!isEditing}
                          placeholder="(555) 123-4567"
                        />
                      </div>

                      {isEditing && (
                        <div className="flex gap-3">
                          <Button type="submit">Save Changes</Button>
                          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </form>
                  </div>
                )}

                {activeTab === "saved" && (
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-6">Saved Businesses</h1>
                    {favoritesLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map(i => (
                          <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse flex gap-4">
                            <div className="w-24 h-24 bg-muted rounded-lg" />
                            <div className="flex-1 space-y-2">
                              <div className="h-5 bg-muted rounded w-1/3" />
                              <div className="h-4 bg-muted rounded w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : favorites.length === 0 ? (
                      <div className="bg-card border border-border rounded-xl p-12 text-center">
                        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No saved businesses yet</p>
                        <Link to="/search">
                          <Button>Explore Businesses</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {favorites.map(business => (
                          <div key={business.id} className="bg-card border border-border rounded-xl p-4 flex gap-4">
                            <img
                              src={business.images[0] || "/placeholder.svg"}
                              alt={business.name}
                              className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <Link 
                                to={`/business/${business.id}`}
                                className="font-semibold text-foreground hover:text-primary transition-colors"
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSaved(business.id)}
                              className="text-destructive hover:text-destructive flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-6">My Reviews</h1>
                    {reviewsLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map(i => (
                          <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse space-y-3">
                            <div className="h-5 bg-muted rounded w-1/3" />
                            <div className="h-4 bg-muted rounded w-full" />
                          </div>
                        ))}
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="bg-card border border-border rounded-xl p-12 text-center">
                        <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">You haven't written any reviews yet</p>
                        <Link to="/search">
                          <Button>Find Businesses to Review</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map(review => (
                          <div key={review.id} className="bg-card border border-border rounded-xl p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <Link 
                                  to={`/business/${review.businessId}`}
                                  className="font-semibold text-foreground hover:text-primary transition-colors"
                                >
                                  {review.businessName}
                                </Link>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating ? "fill-accent text-accent" : "text-muted"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteReview(review.id, review.businessId)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <h4 className="font-medium text-foreground mb-2">{review.title}</h4>
                            <p className="text-muted-foreground">{review.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "inquiries" && (
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-6">My Inquiries</h1>
                    <div className="bg-card border border-border rounded-xl p-12 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No inquiries sent yet</p>
                      <Link to="/search">
                        <Button>Find Businesses</Button>
                      </Link>
                    </div>
                  </div>
                )}

                {activeTab === "listings" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="text-2xl font-bold text-foreground">My Listings</h1>
                      <Link to="/list-business">
                        <Button className="gap-2">
                          <Building2 className="h-4 w-4" />
                          Add New
                        </Button>
                      </Link>
                    </div>
                    {businessesLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="bg-card border border-border rounded-xl p-4 animate-pulse flex gap-4"
                          >
                            <div className="w-24 h-24 bg-muted rounded-lg" />
                            <div className="flex-1 space-y-2">
                              <div className="h-5 bg-muted rounded w-1/3" />
                              <div className="h-4 bg-muted rounded w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : myBusinesses.length === 0 ? (
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
                        {myBusinesses.map((business) => (
                          <div
                            key={business.id}
                            className="bg-card border border-border rounded-xl p-4 flex gap-4"
                          >
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
                                  <Badge
                                    variant="outline"
                                    className="text-primary border-primary gap-1"
                                  >
                                    <CheckCircle2 className="h-3 w-3" />
                                    Approved
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-amber-600 border-amber-600 gap-1"
                                  >
                                    <Clock className="h-3 w-3" />
                                    Pending
                                  </Badge>
                                )}
                              </div>
                              <Link
                                to={`/business/${business.id}`}
                                className="font-semibold text-foreground hover:text-primary transition-colors"
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
                            <div className="flex flex-col gap-2">
                              <Link to={`/business/${business.id}`}>
                                <Button variant="outline" size="sm" className="w-full">
                                  <Edit className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBusiness(business.id)}
                                className="text-destructive hover:text-destructive"
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
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DashboardPage;
