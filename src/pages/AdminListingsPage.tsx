import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Building2, Search, Filter, Check, X, Eye, MoreHorizontal,
  Star, AlertTriangle, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAdminBusinesses } from "@/hooks/useAdminBusinesses";
import { useToast } from "@/hooks/use-toast";

const AdminListingsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const statusFilter = searchParams.get('status') || undefined;
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    allBusinesses, 
    loading, 
    approveBusiness, 
    rejectBusiness, 
    toggleActive,
    toggleFeatured
  } = useAdminBusinesses();

  // Derive status based on Firebase fields
  const businessesWithStatus = allBusinesses.map(b => {
    let status = 'pending';
    if (b.approved) {
      status = b.active !== false ? 'approved' : 'suspended';
    }
    return { ...b, status };
  });

  const filteredBusinesses = businessesWithStatus.filter((b) => {
    const matchesSearch = !searchQuery || 
      (b.name && b.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.address?.city && b.address.city.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = !statusFilter || b.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (businessId: string) => {
    try {
      await approveBusiness(businessId);
      toast({
        title: "Status Updated",
        description: `Business approved`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (businessId: string) => {
    try {
      await rejectBusiness(businessId);
      toast({
        title: "Business Rejected",
        description: `The business listing was rejected and removed.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSuspend = async (businessId: string) => {
    try {
      await toggleActive(businessId, false);
      toast({
        title: "Business Suspended",
        description: `The business has been suspended.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleActivate = async (businessId: string) => {
    try {
      await toggleActive(businessId, true);
      toast({
        title: "Business Activated",
        description: `The business has been reactivated.`,
      });
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
      await toggleFeatured(businessId, !isFeatured);
      toast({
        title: isFeatured ? "Removed from Featured" : "Added to Featured",
      });
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
        return <Badge className="bg-primary hover:bg-primary/90"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-secondary hover:bg-secondary/90"><AlertTriangle className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'suspended':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const statusCounts = {
    all: businessesWithStatus.length,
    pending: businessesWithStatus.filter(b => b.status === 'pending').length,
    approved: businessesWithStatus.filter(b => b.status === 'approved').length,
    suspended: businessesWithStatus.filter(b => b.status === 'suspended').length,
  };

  return (
    <>
      <Helmet>
        <title>Manage Listings | Admin | d4desi</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

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
          variant={statusFilter === 'suspended' ? "default" : "outline"}
          size="sm"
          onClick={() => setSearchParams({ status: 'suspended' })}
        >
          Suspended ({statusCounts.suspended})
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search businesses by name, city or category..."
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
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
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
                            {business.featured && (
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {business.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {business.category}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {business.address?.city ? `${business.address.city}${business.address.state ? `, ${business.address.state}` : ''}` : 'No location'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{business.tier || 'Free'}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(business.status)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {business.createdAt && business.createdAt instanceof Date && !isNaN(business.createdAt.getTime()) 
                        ? business.createdAt.toLocaleDateString() 
                        : 'Unknown Date'}
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
                              <DropdownMenuItem onClick={() => handleApprove(business.id)}>
                                <Check className="h-4 w-4 mr-2 text-green-500" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReject(business.id)}>
                                <X className="h-4 w-4 mr-2 text-destructive" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {business.status === 'approved' && (
                            <DropdownMenuItem onClick={() => handleSuspend(business.id)}>
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {business.status === 'suspended' && (
                            <DropdownMenuItem onClick={() => handleActivate(business.id)}>
                              <Play className="h-4 w-4 mr-2" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleFeatureToggle(business.id, business.featured || false)}>
                            <Star className="h-4 w-4 mr-2" />
                            {business.featured ? 'Remove Featured' : 'Make Featured'}
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
    </>
  );
};

export default AdminListingsPage;
