import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, MapPin, Video, Users, ArrowLeft, Clock, Ticket, Check, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEvent } from "@/hooks/useCommunityEvents";
import { useEventTicketing, EventTicketType } from "@/hooks/useEventTicketing";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  
  const { event, loading: eventLoading, error } = useEvent(id);
  const { getTicketTypes, registerFreeTicket } = useEventTicketing();

  const [tickets, setTickets] = useState<EventTicketType[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);

  // Registration Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<EventTicketType | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [attendeeData, setAttendeeData] = useState({
    name: userProfile?.display_name || "",
    email: user?.email || "",
    phone: userProfile?.phone || "",
    requirements: ""
  });
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [communitySlug, setCommunitySlug] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  // Payment states
  const [paymentStep, setPaymentStep] = useState<'info' | 'payment'>('info');
  const [cardData, setCardData] = useState({ number: "", expiry: "", cvc: "" });

  // Edit Event states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    is_virtual: false,
    virtual_link: "",
    max_attendees: ""
  });

  const { registerPaidTicket } = useEventTicketing();

  useEffect(() => {
    if (id) {
      loadTickets();
      fetchRegistrations();
    }
  }, [id]);

  const fetchRegistrations = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('event_registrations')
      .select('id, ticket_type_id, status')
      .eq('event_id', id)
      .neq('status', 'cancelled');
    if (data) {
      setRegistrations(data);
    }
  };

  useEffect(() => {
    const checkRegistration = async () => {
      if (user && id) {
        const { data } = await supabase
          .from('event_registrations')
          .select('id')
          .eq('event_id', id)
          .eq('user_id', user.id)
          .neq('status', 'cancelled')
          .limit(1);
        if (data && data.length > 0) {
          setIsRegistered(true);
        }
      }
    };
    checkRegistration();
  }, [user, id]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user && event) {
        const { data } = await supabase
          .from('community_members')
          .select('role')
          .eq('community_id', event.community_id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data?.role === 'admin' || data?.role === 'moderator') {
          setIsAdmin(true);
        }

        const { data: commData } = await supabase
          .from('communities')
          .select('slug')
          .eq('id', event.community_id)
          .single();
        if (commData) {
          setCommunitySlug(commData.slug);
        }

        // Prepopulate edit form
        setEditForm({
          title: event.title,
          description: event.description || "",
          event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : "",
          location: event.location || "",
          is_virtual: event.is_virtual || false,
          virtual_link: event.virtual_link || "",
          max_attendees: event.max_attendees ? event.max_attendees.toString() : ""
        });
      }
    };
    checkAdmin();
  }, [user, event]);

  const loadTickets = async () => {
    if (!id) return;
    setLoadingTickets(true);
    const { data } = await getTicketTypes(id);
    if (data) {
      setTickets(data);
    }
    setLoadingTickets(false);
  };

  const handleRegisterClick = (ticket: EventTicketType) => {
    if (!user) {
      toast({ title: "Please sign in to register", variant: "destructive" });
      navigate('/auth');
      return;
    }
    setSelectedTicket(ticket);
    setPaymentStep('info');
    setIsRegisterOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

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
        .eq('id', event.id);

      if (error) throw error;
      toast({ title: "Event updated successfully!" });
      setIsEditOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast({ title: "Failed to update event", description: err.message, variant: "destructive" });
    }
  };

  const submitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !event) return;

    if (selectedTicket.price > 0 && paymentStep === 'info') {
      setPaymentStep('payment');
      return;
    }

    setIsRegistering(true);

    if (selectedTicket.price > 0) {
      // Paid registration simulation
      const { error } = await registerPaidTicket(
        event.id,
        event.community_id,
        selectedTicket.id,
        attendeeData,
        {
          amount: selectedTicket.price,
          transactionId: `TXN-PAYPAL-${Date.now()}`,
          status: 'completed'
        }
      );
      setIsRegistering(false);

      if (error) {
        toast({ title: "Registration failed", description: error, variant: "destructive" });
      } else {
        toast({ title: "Payment and Registration Successful!", description: "Check your ticket in My Tickets." });
        setIsRegisterOpen(false);
        navigate('/tickets');
      }
    } else {
      // Free registration
      const { error } = await registerFreeTicket(
        event.id,
        event.community_id,
        selectedTicket.id,
        attendeeData
      );
      setIsRegistering(false);

      if (error) {
        toast({ title: "Registration failed", description: error, variant: "destructive" });
      } else {
        toast({ title: "Registration Successful!", description: "Check your ticket in My Tickets." });
        setIsRegisterOpen(false);
        navigate('/tickets');
      }
    }
  };

  if (eventLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading event...</div>;
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center text-center">
          <div>
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{event.title} | BusinessHub Events</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {event.image_url ? (
                <div 
                  className="h-64 md:h-80 w-full bg-cover bg-center" 
                  style={{ backgroundImage: `url(${event.image_url})` }}
                />
              ) : (
                <div className="h-48 w-full bg-gradient-to-r from-primary/20 to-primary/5 flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-primary/40" />
                </div>
              )}

              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left Column: Details */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className="bg-primary text-white">
                          {event.is_virtual ? 'Virtual Event' : 'In-Person Event'}
                        </Badge>
                        <Badge className={event.is_paid_event ? "bg-destructive text-white font-bold" : "bg-green-600 text-white font-bold"}>
                          {event.is_paid_event ? 'PAID EVENT' : 'FREE EVENT'}
                        </Badge>
                        {isAdmin && communitySlug && (
                          <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm" className="h-6 text-xs gap-1">
                              <Link to={`/community/${communitySlug}/event/${event.id}/attendees`}>
                                <Users className="h-3 w-3" />
                                Manage Attendees
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" className="h-6 text-xs gap-1" onClick={() => setIsEditOpen(true)}>
                              Edit Event
                            </Button>
                          </div>
                        )}
                      </div>
                      <h1 className="text-3xl font-bold text-foreground mb-4">{event.title}</h1>
                      <div className="text-muted-foreground whitespace-pre-wrap">
                        {event.description || "No description provided."}
                      </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Date and Time</p>
                          <p className="text-muted-foreground">
                            {format(new Date(event.event_date), "EEEE, MMMM d, yyyy")}
                          </p>
                          <p className="text-muted-foreground">
                            {format(new Date(event.event_date), "h:mm a")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        {event.is_virtual ? (
                          <>
                            <Video className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium text-foreground">Virtual Event</p>
                              <p className="text-muted-foreground text-sm">Link will be provided upon registration</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium text-foreground">Location</p>
                              <p className="text-muted-foreground">{event.location}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Ticketing */}
                  <div className="w-full md:w-80 space-y-6">
                    <div className="bg-muted/20 border border-border rounded-xl p-6 shadow-sm sticky top-24">
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-primary" />
                        Tickets
                      </h2>

                      {loadingTickets ? (
                        <div className="animate-pulse space-y-4">
                          <div className="h-16 bg-muted rounded-lg" />
                          <div className="h-16 bg-muted rounded-lg" />
                        </div>
                      ) : tickets.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No tickets available at this time.</p>
                      ) : (
                        <div className="space-y-4">
                          {tickets.map((ticket) => {
                            const soldCount = registrations.filter(r => r.ticket_type_id === ticket.id).length;
                            const capacity = ticket.quantity_available;
                            const remaining = capacity !== null ? Math.max(capacity - soldCount, 0) : null;
                            const isSoldOut = capacity !== null && remaining !== null && remaining <= 0;

                            return (
                              <div key={ticket.id} className="border rounded-lg p-4 bg-background">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h3 className="font-semibold">{ticket.name}</h3>
                                    <p className="text-xs text-muted-foreground">{ticket.description}</p>
                                    {capacity !== null && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {isSoldOut ? (
                                          <span className="text-destructive font-bold">Sold Out</span>
                                        ) : (
                                          <span>Tickets Remaining: <strong className="text-foreground">{remaining}</strong> / {capacity}</span>
                                        )}
                                      </p>
                                    )}
                                  </div>
                                  <div className="font-bold text-lg text-primary">
                                    {ticket.price === 0 ? 'Free' : `$${ticket.price}`}
                                  </div>
                                </div>
                                {isRegistered ? (
                                  <Button 
                                    className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white cursor-default flex items-center justify-center gap-2"
                                    disabled
                                  >
                                    <Check className="h-4 w-4" /> You're Registered!
                                  </Button>
                                ) : isSoldOut ? (
                                  <Button 
                                    className="w-full mt-3 bg-secondary text-secondary-foreground" 
                                    disabled
                                  >
                                    Sold Out
                                  </Button>
                                ) : (
                                  <Button 
                                    className="w-full mt-3" 
                                    onClick={() => handleRegisterClick(ticket)}
                                  >
                                    {ticket.price === 0 ? 'Register Free' : 'Buy Ticket'}
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Registration Modal */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register for {event.title}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <form onSubmit={submitRegistration} className="space-y-4">
              <div className="bg-primary/5 p-3 rounded-md flex justify-between items-center border border-primary/20">
                <span className="font-medium text-sm">{selectedTicket.name}</span>
                <span className="font-bold text-primary">{selectedTicket.price === 0 ? 'Free' : `$${selectedTicket.price}`}</span>
              </div>
              
              {paymentStep === 'info' ? (
                <>
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input 
                      value={attendeeData.name} 
                      onChange={e => setAttendeeData({...attendeeData, name: e.target.value})}
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input 
                      type="email"
                      value={attendeeData.email} 
                      onChange={e => setAttendeeData({...attendeeData, email: e.target.value})}
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Phone (Optional)</Label>
                    <Input 
                      type="tel"
                      value={attendeeData.phone} 
                      onChange={e => setAttendeeData({...attendeeData, phone: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Special Requirements (Optional)</Label>
                    <Textarea 
                      placeholder="Dietary requirements, accessibility needs, etc."
                      value={attendeeData.requirements} 
                      onChange={e => setAttendeeData({...attendeeData, requirements: e.target.value})}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsRegisterOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {selectedTicket.price === 0 ? "Complete Registration" : "Proceed to Payment"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="border rounded-lg p-4 space-y-4 bg-background">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-sm">Credit / Debit Card</span>
                    </div>

                    <div className="space-y-2">
                      <Label>Card Number</Label>
                      <Input 
                        placeholder="4111 2222 3333 4444" 
                        value={cardData.number}
                        onChange={e => setCardData({...cardData, number: e.target.value})}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input 
                          placeholder="MM/YY" 
                          value={cardData.expiry}
                          onChange={e => setCardData({...cardData, expiry: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CVC</Label>
                        <Input 
                          placeholder="123" 
                          value={cardData.cvc}
                          onChange={e => setCardData({...cardData, cvc: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <Button type="button" variant="outline" onClick={() => setPaymentStep('info')}>
                      Back
                    </Button>
                    <Button type="submit" disabled={isRegistering}>
                      {isRegistering ? "Processing..." : `Pay $${selectedTicket.price} & Register`}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Event Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventDetailsPage;
