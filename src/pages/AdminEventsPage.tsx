import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Calendar, Users, Building2, MapPin, Eye, Edit, Shield, ExternalLink, Ticket, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";

interface AdminEvent {
  id: string;
  community_id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  is_virtual: boolean;
  virtual_link: string | null;
  max_attendees: number | null;
  created_at: string;
  community?: {
    name: string;
    slug: string;
  };
  registrations_count?: number;
  min_price?: number;
}

interface AdminCommunity {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string | null;
  member_count: number;
}

const AdminEventsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [communities, setCommunities] = useState<AdminCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunityFilter, setSelectedCommunityFilter] = useState("all");

  // Edit Event State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    is_virtual: false,
    virtual_link: "",
    max_attendees: ""
  });

  // Ticket Management State
  const [isTicketsOpen, setIsTicketsOpen] = useState(false);
  const [selectedEventForTickets, setSelectedEventForTickets] = useState<AdminEvent | null>(null);
  const [eventTickets, setEventTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const fetchEventTickets = async (eventId: string) => {
    try {
      setLoadingTickets(true);
      const { data, error } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('event_id', eventId)
        .order('price', { ascending: true });

      if (error) throw error;
      setEventTickets(data || []);
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      toast({ title: "Failed to load tickets", description: err.message, variant: "destructive" });
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleManageTicketsClick = (event: AdminEvent) => {
    setSelectedEventForTickets(event);
    setIsTicketsOpen(true);
    fetchEventTickets(event.id);
  };

  const handleDeleteTicket = async (ticket: any) => {
    if (!selectedEventForTickets) return;

    if (!window.confirm(`Are you sure you want to delete the ticket tier "${ticket.name}"?`)) {
      return;
    }

    try {
      // Check for active registrations
      const { data: regs, error: regsError } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('ticket_type_id', ticket.id)
        .neq('status', 'cancelled')
        .limit(1);

      if (regsError) throw regsError;

      if (regs && regs.length > 0) {
        // Pausing ticket since it has historical registration data
        const { error: updateError } = await supabase
          .from('event_tickets')
          .update({ status: 'paused' })
          .eq('id', ticket.id);

        if (updateError) throw updateError;
        toast({ title: "Ticket type has active registrations. It was successfully PAUSED to preserve history." });
      } else {
        // Safe delete
        const { error: deleteError } = await supabase
          .from('event_tickets')
          .delete()
          .eq('id', ticket.id);

        if (deleteError) throw deleteError;
        toast({ title: "Ticket type deleted successfully!" });
      }

      fetchEventTickets(selectedEventForTickets.id);
      loadData(); // reload pricing badge on dashboard
    } catch (err: any) {
      console.error('Error deleting ticket:', err);
      toast({ title: "Failed to delete ticket", description: err.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch communities
      const { data: commsData } = await supabase
        .from('communities')
        .select('id, name, slug, type, city, member_count');
      setCommunities(commsData || []);

      // 2. Fetch events with community details
      const { data: eventsData, error: eventsError } = await supabase
        .from('community_events')
        .select(`
          *,
          community:communities(name, slug)
        `)
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;

      // 3. Fetch registration counts for each event
      const { data: regsData } = await supabase
        .from('event_registrations')
        .select('id, event_id');

      // 4. Fetch ticket price ranges for each event
      const { data: ticketsData } = await supabase
        .from('event_tickets')
        .select('event_id, price');

      const mappedEvents: AdminEvent[] = (eventsData || []).map((event: any) => {
        const regs = (regsData || []).filter(r => r.event_id === event.id).length;
        const prices = (ticketsData || []).filter(t => t.event_id === event.id).map(t => t.price);
        const minTicketPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const minPrice = event.is_paid_event 
          ? (event.ticket_price !== null && event.ticket_price !== undefined ? event.ticket_price : minTicketPrice)
          : 0;
        
        return {
          ...event,
          registrations_count: regs,
          min_price: minPrice
        };
      });

      setEvents(mappedEvents);
    } catch (err: any) {
      console.error('Error fetching admin events:', err);
      toast({ title: "Failed to load events", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (event: AdminEvent) => {
    setSelectedEvent(event);
    setEditForm({
      title: event.title,
      description: event.description || "",
      event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : "",
      location: event.location || "",
      is_virtual: event.is_virtual || false,
      virtual_link: event.virtual_link || "",
      max_attendees: event.max_attendees ? event.max_attendees.toString() : ""
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      const { error } = await supabase
        .from('community_events')
        .update({
          title: editForm.title,
          description: editForm.description || null,
          event_date: new Date(editForm.event_date).toISOString(),
          location: editForm.location || null,
          is_virtual: editForm.is_virtual,
          virtual_link: editForm.virtual_link || null,
          max_attendees: editForm.max_attendees ? parseInt(editForm.max_attendees) : null
        })
        .eq('id', selectedEvent.id);

      if (error) throw error;
      toast({ title: "Event updated successfully!" });
      setIsEditOpen(false);
      loadData(); // Reload list
    } catch (err: any) {
      toast({ title: "Failed to update event", description: err.message, variant: "destructive" });
    }
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.community?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.location || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCommunity = selectedCommunityFilter === 'all' || e.community_id === selectedCommunityFilter;

    return matchesSearch && matchesCommunity;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Loading events dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Events & Tickets | Admin | d4desi</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Events & Ticketing Console
          </h1>
          <p className="text-muted-foreground mt-1">
            Global administrative control of communities, events, and ticket registrations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Communities Quick List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Communities ({communities.length})
              </CardTitle>
              <CardDescription>Filter events list by community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 p-2">
              <Button
                variant={selectedCommunityFilter === 'all' ? 'default' : 'ghost'}
                className="w-full justify-start text-sm"
                onClick={() => setSelectedCommunityFilter('all')}
              >
                All Communities
              </Button>
              {communities.map(comm => (
                <Button
                  key={comm.id}
                  variant={selectedCommunityFilter === comm.id ? 'default' : 'ghost'}
                  className="w-full justify-start text-sm truncate"
                  onClick={() => setSelectedCommunityFilter(comm.id)}
                  title={comm.name}
                >
                  {comm.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Events Table */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold">Platform Events</CardTitle>
                <CardDescription>List of scheduled events, tickets and registered attendee counts</CardDescription>
              </div>
              
              <div className="relative max-w-xs w-full">
                <Input
                  placeholder="Search events, cities..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-background"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Info</TableHead>
                      <TableHead>Community</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          No scheduled events found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEvents.map(event => {
                        const isPast = new Date(event.event_date) < new Date();
                        const isFull = event.max_attendees && (event.registrations_count || 0) >= event.max_attendees;

                        return (
                          <TableRow key={event.id} className="hover:bg-muted/10">
                            <TableCell>
                              <div>
                                <p className="font-semibold text-foreground">{event.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {format(new Date(event.event_date), "MMM d, yyyy • h:mm a")}
                                </p>
                                <Badge className="mt-1.5 text-[9px] uppercase h-4" variant={isPast ? 'secondary' : 'default'}>
                                  {isPast ? 'Past' : 'Upcoming'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {event.community?.name || 'Unknown'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {event.is_virtual ? (
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">Virtual</span>
                              ) : (
                                <span className="text-muted-foreground truncate max-w-[150px] inline-block">{event.location || 'TBA'}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm font-semibold">
                              {event.is_paid_event ? (
                                <span className="text-destructive font-semibold">Paid (${event.min_price})</span>
                              ) : (
                                <span className="text-green-600 font-semibold">Free</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className="font-bold" variant="outline">
                                {event.registrations_count || 0} registered
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {event.max_attendees || 'Unlimited'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1.5">
                                <Button asChild size="icon" variant="ghost" title="View Event">
                                  <Link to={`/community/event/${event.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button size="icon" variant="ghost" title="Edit Event" onClick={() => handleEditClick(event)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" title="Manage Tickets" onClick={() => handleManageTicketsClick(event)}>
                                  <Ticket className="h-4 w-4" />
                                </Button>
                                <Button asChild size="sm" variant="outline" className="h-8 gap-1.5">
                                  <Link to={`/community/${event.community?.slug || 'comm'}/event/${event.id}/attendees`}>
                                    <Users className="h-3.5 w-3.5" /> Attendees
                                  </Link>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Event Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Edit Scheduled Event
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Event Title *</Label>
                <Input
                  value={editForm.title}
                  onChange={e => setEditForm({...editForm, title: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editForm.description}
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={editForm.event_date}
                  onChange={e => setEditForm({...editForm, event_date: e.target.value})}
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={editForm.is_virtual}
                  onCheckedChange={checked => setEditForm({...editForm, is_virtual: checked})}
                />
                <Label>Virtual Event</Label>
              </div>

              {editForm.is_virtual ? (
                <div className="space-y-2 animate-in fade-in-50 duration-200">
                  <Label>Virtual Meeting URL</Label>
                  <Input
                    placeholder="https://zoom.us/j/..."
                    value={editForm.virtual_link}
                    onChange={e => setEditForm({...editForm, virtual_link: e.target.value})}
                  />
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in-50 duration-200">
                  <Label>Location</Label>
                  <Input
                    placeholder="Event Location"
                    value={editForm.location}
                    onChange={e => setEditForm({...editForm, location: e.target.value})}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Max Attendees (Optional)</Label>
                <Input
                  type="number"
                  value={editForm.max_attendees}
                  onChange={e => setEditForm({...editForm, max_attendees: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Ticket Management Modal */}
      <Dialog open={isTicketsOpen} onOpenChange={setIsTicketsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              Manage Event Tickets
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="font-semibold text-foreground">{selectedEventForTickets?.title}</h3>
              <p className="text-xs text-muted-foreground">
                {selectedEventForTickets?.event_date && format(new Date(selectedEventForTickets.event_date), "MMM d, yyyy • h:mm a")}
              </p>
            </div>

            {loadingTickets ? (
              <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
                Loading tickets...
              </div>
            ) : eventTickets.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No tickets configured for this event.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tier Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventTickets.map((ticket) => {
                      const isPaused = ticket.status === 'paused';
                      return (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">{ticket.name}</TableCell>
                          <TableCell>{ticket.price === 0 ? 'Free' : `$${ticket.price}`}</TableCell>
                          <TableCell>{ticket.quantity_available ?? 'Unlimited'}</TableCell>
                          <TableCell>
                            <Badge variant={isPaused ? "secondary" : "default"}>
                              {ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteTicket(ticket)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-border">
              <Button type="button" onClick={() => setIsTicketsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminEventsPage;
