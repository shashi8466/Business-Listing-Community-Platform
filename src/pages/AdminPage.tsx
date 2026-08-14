import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  Building2,
  Clock,
  MapPin,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useAdminBusinesses } from "@/hooks/useAdminBusinesses";
import { CATEGORIES } from "@/types";

const AdminPage = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const {
    pendingBusinesses,
    allBusinesses,
    loading,
    approveBusiness,
    rejectBusiness,
    toggleActive,
  } = useAdminBusinesses();

  // Check if user is admin (role === 'admin')
  const isAdmin = userProfile?.role === "admin";

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <>
        <Helmet>
          <title>Access Denied - BusinessHub</title>
        </Helmet>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Access Denied
              </h1>
              <p className="text-muted-foreground mb-6">
                You don't have permission to view this page.
              </p>
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  const getCategoryName = (id: string) =>
    CATEGORIES.find((c) => c.id === id)?.name || id;

  const handleApprove = async (businessId: string) => {
    try {
      await approveBusiness(businessId);
      toast({
        title: "Business Approved",
        description: "The listing is now live.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve business.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (businessId: string) => {
    try {
      await rejectBusiness(businessId);
      toast({
        title: "Business Rejected",
        description: "The listing has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject business.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (businessId: string, currentActive: boolean) => {
    try {
      await toggleActive(businessId, !currentActive);
      toast({
        title: currentActive ? "Business Deactivated" : "Business Activated",
        description: currentActive
          ? "The listing is now hidden."
          : "The listing is now visible.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update business.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Panel - BusinessHub</title>
        <meta name="description" content="Admin panel for managing BusinessHub business listings" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-muted-foreground">
                  Manage business listings and approvals
                </p>
              </div>
            </div>

            <Tabs defaultValue="pending">
              <TabsList className="mb-6">
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Pending ({pendingBusinesses.length})
                </TabsTrigger>
                <TabsTrigger value="all" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  All Listings ({allBusinesses.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="bg-card border border-border rounded-xl p-5 animate-pulse"
                      >
                        <div className="h-6 bg-muted rounded w-1/3 mb-3" />
                        <div className="h-4 bg-muted rounded w-full mb-2" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : pendingBusinesses.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No pending listings to review
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingBusinesses.map((business) => (
                      <div
                        key={business.id}
                        className="bg-card border border-border rounded-xl p-5"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">
                                {getCategoryName(business.category)}
                              </Badge>
                              <Badge variant="outline" className="text-amber-600 border-amber-600">
                                Pending
                              </Badge>
                            </div>
                            <Link
                              to={`/business/${business.id}`}
                              className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
                            >
                              {business.name}
                            </Link>
                            <p className="text-muted-foreground line-clamp-2 mt-1">
                              {business.description}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                              <MapPin className="h-4 w-4" />
                              {business.address.city}, {business.address.state}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Submitted: {new Date(business.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Link to={`/business/${business.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                            </Link>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(business.id)}
                              className="gap-1"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReject(business.id)}
                              className="gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-card border border-border rounded-xl p-5 animate-pulse"
                      >
                        <div className="h-6 bg-muted rounded w-1/3 mb-3" />
                        <div className="h-4 bg-muted rounded w-full" />
                      </div>
                    ))}
                  </div>
                ) : allBusinesses.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No listings found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allBusinesses.map((business) => (
                      <div
                        key={business.id}
                        className="bg-card border border-border rounded-xl p-5"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">
                                {getCategoryName(business.category)}
                              </Badge>
                              {business.approved ? (
                                <Badge variant="outline" className="text-primary border-primary">
                                  Approved
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-amber-600 border-amber-600">
                                  Pending
                                </Badge>
                              )}
                              {business.active ? (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <Link
                              to={`/business/${business.id}`}
                              className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                            >
                              {business.name}
                            </Link>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-4 w-4" />
                              {business.address.city}, {business.address.state}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link to={`/business/${business.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(business.id, business.active)}
                              className="gap-1"
                            >
                              {business.active ? (
                                <>
                                  <ToggleRight className="h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </Button>
                            {!business.approved && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApprove(business.id)}
                              >
                                Approve
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AdminPage;
