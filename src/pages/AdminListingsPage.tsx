import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Building2, Search, Filter, Check, X, Eye, MoreHorizontal,
  ChevronLeft, ChevronRight, Star, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin, useAdminBusinessesList } from "@/hooks/useMarketplace";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ListingStatus } from "@/types/marketplace";

const AdminListingsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  
  const statusFilter = (searchParams.get('status') as ListingStatus) || undefined;
  const [searchQuery, setSearchQuery] = useState('');
  
  const { businesses, loading, refetch } = useAdminBusinessesList(statusFilter);

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  const filteredBusinesses = businesses.filter((b) =>
    !searchQuery || 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = async (businessId: string, newStatus: ListingStatus) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ status: newStatus })
        .eq('id', businessId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Business status changed to ${newStatus}`,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFeatureToggle = async (businessId: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ is_featured: !isFeatured })
        .eq('id', businessId);

      if (error) throw error;

      toast({
        title: isFeatured ? "Removed from Featured" : "Added to Featured",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-primary"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'suspended':
        return <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const statusCounts = {
    all: businesses.length,
    pending: businesses.filter(b => b.status === 'pending').length,
    approved: businesses.filter(b => b.status === 'approved').length,
    rejected: businesses.filter(b => b.status === 'rejected').length,
  };

  return (
    <>
      <Helmet>
        <title>Manage Listings | Admin | d4desi</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-primary" />
                  Manage Listings
                </h1>
                <p className="text-muted-foreground mt-1">
                  Review and moderate business listings
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/admin/dashboard">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={!statusFilter ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchParams({})}
              >
                All ({statusCounts.all})
              </Button>
              <Button
                variant={statusFilter === 'pending' ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchParams({ status: 'pending' })}
              >
                Pending ({statusCounts.pending})
              </Button>
              <Button
                variant={statusFilter === 'approved' ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchParams({ status: 'approved' })}
              >
                Approved ({statusCounts.approved})
              </Button>
              <Button
                variant={statusFilter === 'rejected' ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchParams({ status: 'rejected' })}
              >
                Rejected ({statusCounts.rejected})
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 max-w-md"
              />
            </div>

            {/* Listings Table */}
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse flex items-center gap-4">
                        <div className="h-12 w-12 bg-muted rounded" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/3" />
                          <div className="h-3 bg-muted rounded w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredBusinesses.length === 0 ? (
                  <div className="py-16 text-center">
                    <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">No listings found</h2>
                    <p className="text-muted-foreground">
                      {statusFilter ? `No ${statusFilter} listings` : 'No businesses to display'}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBusinesses.map((business) => (
                        <TableRow key={business.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground flex items-center gap-2">
                                  {business.name}
                                  {business.is_featured && (
                                    <Star className="h-4 w-4 text-accent fill-accent" />
                                  )}
                                </p>
                                <p className="text-sm text-muted-foreground">{business.slug}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {business.category}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {business.city}, {business.state}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(business.status)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{business.membership_tier}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(business.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/business/${business.id}`)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Listing
                                </DropdownMenuItem>
                                {business.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleStatusChange(business.id, 'approved')}>
                                      <Check className="h-4 w-4 mr-2 text-primary" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(business.id, 'rejected')}>
                                      <X className="h-4 w-4 mr-2 text-destructive" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {business.status === 'approved' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(business.id, 'suspended')}>
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Suspend
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleFeatureToggle(business.id, business.is_featured)}>
                                  <Star className="h-4 w-4 mr-2" />
                                  {business.is_featured ? 'Remove Featured' : 'Make Featured'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AdminListingsPage;
