import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Users, Download, Mail, Search, CheckCircle, Ticket, XCircle, Info, Calendar, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/hooks/useCommunities";
import { useEvent } from "@/hooks/useCommunityEvents";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const EventAttendeesPage = () => {
  const { slug, eventId } = useParams<{ slug: string; eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { community, membership, loading: communityLoading } = useCommunity(slug);
  const { event, loading: eventLoading } = useEvent(eventId);

  const { toast } = useToast();
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Selected attendee modal
  const [selectedAttendee, setSelectedAttendee] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    if (eventId && community && membership && (membership.role === 'admin' || membership.role === 'moderator')) {
      fetchAttendees();
    } else if (communityLoading === false && eventLoading === false) {
      setLoading(false);
    }
  }, [eventId, community, membership, communityLoading, eventLoading]);

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          ticket_type:event_tickets(name, price),
          payment:payments(status, amount)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttendees(data || []);
    } catch (err) {
      console.error('Error fetching attendees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (registrationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status: newStatus })
        .eq('id', registrationId);
        
      if (error) throw error;
      
      setAttendees(attendees.map(a => 
        a.id === registrationId ? { ...a, status: newStatus } : a
      ));
      if (selectedAttendee?.id === registrationId) {
        setSelectedAttendee(prev => prev ? { ...prev, status: newStatus } : null);
      }
      toast({ title: `Registration status updated to ${newStatus}` });
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast({ title: "Failed to update status", description: err.message, variant: "destructive" });
    }
  };

  const handleExportCSV = () => {
    if (attendees.length === 0) return;
    const headers = ["Name", "Email", "Phone", "Ticket Number", "Ticket Type", "Amount", "Status", "Registration Date"];
    const rows = attendees.map(a => [
      a.attendee_name,
      a.attendee_email,
      a.attendee_phone || "N/A",
      a.ticket_number,
      a.ticket_type?.name || "General",
      a.ticket_type?.price === 0 ? "Free" : `$${a.ticket_type?.price}`,
      a.status,
      format(new Date(a.created_at), "yyyy-MM-dd HH:mm")
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendees-${event?.title.toLowerCase().replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Exported CSV", description: "Your attendee file is downloading." });
  };

  if (communityLoading || eventLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const isModerator = membership?.role === 'admin' || membership?.role === 'moderator';
  if (!isModerator) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">Only community moderators can view attendees.</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredAttendees = attendees.filter(a => {
    const matchesSearch = 
      a.attendee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.attendee_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.ticket_number.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && a.status === statusFilter;
  });

  const totalCount = attendees.length;
  const confirmedCount = attendees.filter(a => a.status === 'confirmed' || a.status === 'checked_in').length;
  const pendingCount = attendees.filter(a => a.status === 'pending').length;
  const cancelledCount = attendees.filter(a => a.status === 'cancelled').length;

  return (
    <>
      <Helmet>
        <title>Attendees: {event?.title} | BusinessHub</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <Button variant="ghost" onClick={() => navigate(`/community/${slug}`)} className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Community
            </Button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  Manage Attendees
                </h1>
                <p className="text-muted-foreground text-lg">
                  {event?.title} • {event?.event_date ? format(new Date(event.event_date), "MMM d, yyyy") : ''}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
                <Ticket className="h-6 w-6 text-muted-foreground mb-1.5" />
                <p className="text-3xl font-bold text-foreground">{totalCount}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Registrations</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
                <CheckCircle className="h-6 w-6 text-green-500 mb-1.5" />
                <p className="text-3xl font-bold text-green-600">{confirmedCount}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Confirmed</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
                <Info className="h-6 w-6 text-amber-500 mb-1.5" />
                <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
                <XCircle className="h-6 w-6 text-red-500 mb-1.5" />
                <p className="text-3xl font-bold text-red-600">{cancelledCount}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Cancelled</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-muted/20">
                <div className="relative max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search name, email, or ticket #" 
                    className="pl-9 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium uppercase">Filter:</span>
                  <select
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-primary"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Attendee</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Ticket #</TableHead>
                      <TableHead>Ticket Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered On</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No attendees found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAttendees.map((attendee) => (
                        <TableRow key={attendee.id} className="hover:bg-muted/10">
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{attendee.attendee_name}</p>
                              <p className="text-xs text-muted-foreground">{attendee.attendee_email}</p>
                              {attendee.special_requirements && (
                                <Badge variant="outline" className="mt-1 text-[9px] uppercase border-orange-200 bg-orange-50 text-orange-700">Special Needs</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{attendee.attendee_phone || 'N/A'}</TableCell>
                          <TableCell>
                            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded border border-border/40">{attendee.ticket_number}</span>
                          </TableCell>
                          <TableCell className="text-sm font-medium">{attendee.ticket_type?.name || 'General'}</TableCell>
                          <TableCell className="text-sm font-semibold">
                            {attendee.ticket_type?.price === 0 ? 'Free' : `$${attendee.ticket_type?.price}`}
                          </TableCell>
                          <TableCell>
                            {attendee.status === 'checked_in' ? (
                              <Badge className="bg-green-500 hover:bg-green-600">Checked In</Badge>
                            ) : attendee.status === 'confirmed' ? (
                              <Badge variant="secondary">Confirmed</Badge>
                            ) : attendee.status === 'pending' ? (
                              <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">Pending</Badge>
                            ) : (
                              <Badge variant="destructive">Cancelled</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(new Date(attendee.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAttendee(attendee);
                                setIsDetailsOpen(true);
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Attendee Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Users className="h-5 w-5 text-primary" />
              Attendee Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedAttendee && (
            <div className="space-y-6 pt-2">
              <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                  {selectedAttendee.attendee_name[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{selectedAttendee.attendee_name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedAttendee.attendee_email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Phone</p>
                  <p className="font-medium text-foreground mt-0.5">{selectedAttendee.attendee_phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Status</p>
                  <Badge className="mt-1" variant={selectedAttendee.status === 'checked_in' || selectedAttendee.status === 'confirmed' ? 'default' : 'secondary'}>
                    {selectedAttendee.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Ticket Type</p>
                  <p className="font-medium text-foreground mt-0.5">{selectedAttendee.ticket_type?.name || 'General'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Amount Paid</p>
                  <p className="font-medium text-foreground mt-0.5">
                    {selectedAttendee.ticket_type?.price === 0 ? 'Free' : `$${selectedAttendee.ticket_type?.price}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Ticket Number</p>
                  <p className="font-mono text-sm text-foreground mt-0.5">{selectedAttendee.ticket_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Registration Date</p>
                  <p className="font-medium text-foreground mt-0.5">
                    {format(new Date(selectedAttendee.created_at), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              </div>

              {selectedAttendee.special_requirements && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-orange-800 flex items-center gap-1.5">
                    <Info className="h-4 w-4" /> Requirements / Notes
                  </p>
                  <p className="text-orange-700 mt-1 text-xs">{selectedAttendee.special_requirements}</p>
                </div>
              )}

              {/* QR Preview */}
              <div className="flex flex-col items-center justify-center border border-border/50 p-4 rounded-xl bg-muted/10">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(selectedAttendee.qr_code_data)}`} 
                  alt="QR Ticket Code" 
                  className="w-32 h-32 border bg-white p-2 rounded-lg"
                />
                <span className="text-[10px] text-muted-foreground mt-2">Unique Ticket QR Verification</span>
              </div>

              {/* Admin Actions */}
              <div className="border-t border-border pt-4 flex flex-col gap-2">
                <div className="flex gap-2">
                  {selectedAttendee.status !== 'checked_in' ? (
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
                      onClick={() => handleUpdateStatus(selectedAttendee.id, 'checked_in')}
                    >
                      Check In Attendee
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1" 
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedAttendee.id, 'confirmed')}
                    >
                      Undo Check In
                    </Button>
                  )}
                  
                  {selectedAttendee.status !== 'cancelled' && (
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleUpdateStatus(selectedAttendee.id, 'cancelled')}
                    >
                      Cancel Registration
                    </Button>
                  )}
                </div>
                
                <Button variant="ghost" onClick={() => setIsDetailsOpen(false)} className="w-full">
                  Close Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventAttendeesPage;
