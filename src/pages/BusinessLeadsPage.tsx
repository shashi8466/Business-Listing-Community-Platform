import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Users, Mail, Phone, Eye, MessageSquare, CheckCircle, 
  Clock, XCircle, Filter, Search, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useUserBusinesses, useBusinessLeads } from "@/hooks/useMarketplace";
import { useToast } from "@/hooks/use-toast";

const BusinessLeadsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { businesses } = useUserBusinesses();
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { leads, loading } = useBusinessLeads(selectedBusiness);

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Mock leads for demo
  const mockLeads = [
    { id: '1', name: 'John Smith', email: 'john@example.com', phone: '555-0123', message: 'Interested in your services', status: 'new', created_at: '2024-01-20T10:00:00Z', credit_cost: 1 },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '555-0124', message: 'Looking for a quote', status: 'viewed', created_at: '2024-01-19T14:30:00Z', credit_cost: 1 },
    { id: '3', name: 'Mike Davis', email: 'mike@example.com', phone: null, message: 'Need help with my project', status: 'contacted', created_at: '2024-01-18T09:15:00Z', credit_cost: 1 },
    { id: '4', name: 'Emily Brown', email: 'emily@example.com', phone: '555-0126', message: 'Referral from a friend', status: 'converted', created_at: '2024-01-15T16:45:00Z', credit_cost: 1 },
  ];

  const displayLeads = leads.length > 0 ? leads : mockLeads;

  const filteredLeads = displayLeads.filter((lead: any) => {
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSearch = !searchQuery || 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-primary"><Clock className="h-3 w-3 mr-1" />New</Badge>;
      case 'viewed':
        return <Badge variant="secondary"><Eye className="h-3 w-3 mr-1" />Viewed</Badge>;
      case 'contacted':
        return <Badge variant="outline"><MessageSquare className="h-3 w-3 mr-1" />Contacted</Badge>;
      case 'converted':
        return <Badge className="bg-primary"><CheckCircle className="h-3 w-3 mr-1" />Converted</Badge>;
      case 'expired':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const leadCredits = {
    total: 25,
    used: 12,
    remaining: 13,
  };

  return (
    <>
      <Helmet>
        <title>Lead Management | d4desi</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  Lead Management
                </h1>
                <p className="text-muted-foreground mt-1">
                  View and manage your customer inquiries
                </p>
              </div>
              <div className="flex items-center gap-4">
                {businesses.length > 0 && (
                  <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select business" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Lead Credits Card */}
            <Card className="mb-8">
              <CardContent className="py-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <CreditCard className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lead Credits</p>
                      <p className="text-2xl font-bold text-foreground">
                        {leadCredits.remaining} <span className="text-muted-foreground text-base font-normal">/ {leadCredits.total}</span>
                      </p>
                    </div>
                    <div className="h-12 w-px bg-border" />
                    <div>
                      <p className="text-sm text-muted-foreground">Used This Month</p>
                      <p className="text-xl font-semibold text-foreground">{leadCredits.used}</p>
                    </div>
                  </div>
                  <Button asChild>
                    <Link to="/business/leads/pricing">Buy More Credits</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leads Table */}
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse flex items-center gap-4">
                        <div className="h-10 w-10 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/4" />
                          <div className="h-3 bg-muted rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="py-16 text-center">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">No leads yet</h2>
                    <p className="text-muted-foreground">
                      Leads will appear here when customers contact you through your listing.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contact</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead: any) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{lead.name}</p>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {lead.email}
                                </span>
                                {lead.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {lead.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm text-muted-foreground truncate">
                              {lead.message || 'No message'}
                            </p>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(lead.status)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
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

export default BusinessLeadsPage;
