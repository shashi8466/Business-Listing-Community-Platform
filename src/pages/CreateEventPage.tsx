import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCommunityEvents } from "@/hooks/useCommunityEvents";
import { useCommunity } from "@/hooks/useCommunities";
import { useEventTicketing, EventTicketType } from "@/hooks/useEventTicketing";

const CreateEventPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  
  const { community, membership, loading: communityLoading } = useCommunity(slug);
  const { createEvent } = useCommunityEvents(community?.id);
  const { createTicketType } = useEventTicketing();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    end_date: "",
    event_type: "in-person" as "in-person" | "virtual" | "hybrid",
    location: "",
    virtual_link: "",
    registration_type: "free" as "free" | "paid",
    max_attendees: "",
  });

  // Ticket types state (only used if registration_type === 'paid')
  const [ticketTypes, setTicketTypes] = useState<Partial<EventTicketType>[]>([
    { name: "General Admission", price: 10, quantity_available: null, max_per_user: 1 }
  ]);

  const handleAddTicket = () => {
    setTicketTypes([...ticketTypes, { name: "", price: 0, quantity_available: null, max_per_user: 1 }]);
  };

  const handleRemoveTicket = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const updateTicket = (index: number, field: keyof EventTicketType, value: any) => {
    const newTickets = [...ticketTypes];
    newTickets[index] = { ...newTickets[index], [field]: value };
    setTicketTypes(newTickets);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !community) return;

    if (!formData.title.trim() || !formData.event_date) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    if (formData.registration_type === 'paid' && ticketTypes.some(t => !t.name || t.price === undefined || t.price < 0)) {
      toast({ title: "Please fill in all ticket details correctly", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // 1. Create the Event
      const is_virtual = formData.event_type === 'virtual' || formData.event_type === 'hybrid';
      const is_paid_event = formData.registration_type === 'paid';
      const ticket_price = is_paid_event 
        ? (ticketTypes[0]?.price || 0)
        : 0;
      
      const { data: eventData, error: eventError } = await createEvent({
        title: formData.title,
        description: formData.description || undefined,
        event_date: new Date(formData.event_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
        location: formData.location || undefined,
        is_virtual,
        virtual_link: formData.virtual_link || undefined,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : undefined,
        is_paid_event,
        ticket_price,
        currency: 'USD',
        requires_registration: true,
        total_tickets: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        ticket_types: is_paid_event ? ticketTypes : [{ name: 'General Admission', price: 0 }]
      });

      if (eventError || !eventData) throw new Error(eventError || "Failed to create event");

      // 2. Create Ticket Types
      if (formData.registration_type === 'free') {
        // Create a default free ticket
        const { error: ticketError } = await createTicketType({
          event_id: eventData.id,
          name: "General Admission (Free)",
          description: "Standard free registration",
          price: 0,
          quantity_available: formData.max_attendees ? parseInt(formData.max_attendees) : null,
          max_per_user: 1
        });
        if (ticketError) throw new Error(ticketError);
      } else {
        // Create all defined paid ticket types
        for (const ticket of ticketTypes) {
          const { error: ticketError } = await createTicketType({
            event_id: eventData.id,
            name: ticket.name,
            description: ticket.description,
            price: ticket.price,
            quantity_available: ticket.quantity_available || null,
            max_per_user: ticket.max_per_user || 1
          });
          if (ticketError) throw new Error(ticketError);
        }
      }

      toast({ title: "Event created successfully!" });
      navigate(`/community/event/${eventData.id}`);
      
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({ title: "Failed to create event", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (communityLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Security check: Only admins/moderators can create events
  const isGlobalAdmin = userProfile?.role === 'admin';
  const isModerator = membership?.role === 'admin' || membership?.role === 'moderator' || isGlobalAdmin;
  if (!isModerator) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">Only community moderators can create events.</p>
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
        <title>Create Event | {community?.name}</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-3xl">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Community
            </Button>

            <div className="bg-card border border-border rounded-xl p-6 md:p-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Create an Event</h1>
              <p className="text-muted-foreground mb-8">for {community?.name}</p>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Details */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold border-b pb-2">Basic Details</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Tech Meetup 2026"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="What is this event about?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold border-b pb-2">Date & Time</h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event_date">Start Date & Time *</Label>
                      <Input
                        id="event_date"
                        type="datetime-local"
                        value={formData.event_date}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date & Time (Optional)</Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold border-b pb-2">Location</h2>
                  
                  <div className="space-y-2">
                    <Label>Event Type *</Label>
                    <RadioGroup
                      value={formData.event_type}
                      onValueChange={(val: any) => setFormData({ ...formData, event_type: val })}
                      className="flex flex-col sm:flex-row gap-4 pt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="in-person" id="in-person" />
                        <Label htmlFor="in-person">In-person</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="virtual" id="virtual" />
                        <Label htmlFor="virtual">Virtual</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hybrid" id="hybrid" />
                        <Label htmlFor="hybrid">Hybrid</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {(formData.event_type === 'in-person' || formData.event_type === 'hybrid') && (
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="location">Physical Location *</Label>
                      <Input
                        id="location"
                        placeholder="Venue name and address"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required={formData.event_type !== 'virtual'}
                      />
                    </div>
                  )}

                  {(formData.event_type === 'virtual' || formData.event_type === 'hybrid') && (
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="virtual_link">Virtual Meeting URL *</Label>
                      <Input
                        id="virtual_link"
                        type="url"
                        placeholder="https://zoom.us/j/..."
                        value={formData.virtual_link}
                        onChange={(e) => setFormData({ ...formData, virtual_link: e.target.value })}
                        required={formData.event_type !== 'in-person'}
                      />
                    </div>
                  )}
                </div>

                {/* Ticketing & Registration */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold border-b pb-2">Ticketing</h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_attendees">Maximum Attendees (Optional)</Label>
                      <Input
                        id="max_attendees"
                        type="number"
                        min="1"
                        placeholder="Leave blank for unlimited"
                        value={formData.max_attendees}
                        onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Registration Type *</Label>
                      <RadioGroup
                        value={formData.registration_type}
                        onValueChange={(val: any) => setFormData({ ...formData, registration_type: val })}
                        className="flex items-center gap-4 pt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="free" id="free" />
                          <Label htmlFor="free">Free</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="paid" id="paid" />
                          <Label htmlFor="paid">Paid</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {formData.registration_type === 'paid' && (
                    <div className="mt-6 space-y-4 bg-muted/30 p-4 rounded-xl border">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Ticket Types</Label>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddTicket} className="gap-2">
                          <Plus className="h-4 w-4" /> Add Ticket Tier
                        </Button>
                      </div>

                      {ticketTypes.map((ticket, index) => (
                        <div key={index} className="grid sm:grid-cols-12 gap-4 p-4 bg-background border rounded-lg relative">
                          {ticketTypes.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveTicket(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <div className="sm:col-span-5 space-y-2">
                            <Label>Ticket Name</Label>
                            <Input 
                              placeholder="e.g. VIP" 
                              value={ticket.name} 
                              onChange={(e) => updateTicket(index, 'name', e.target.value)} 
                              required
                            />
                          </div>
                          <div className="sm:col-span-3 space-y-2">
                            <Label>Price ($)</Label>
                            <Input 
                              type="number" 
                              min="1" 
                              step="0.01"
                              value={isNaN(ticket.price) ? "" : ticket.price} 
                              onChange={(e) => updateTicket(index, 'price', e.target.value ? parseFloat(e.target.value) : NaN)} 
                              required
                            />
                          </div>
                          <div className="sm:col-span-4 space-y-2">
                            <Label>Quantity Available</Label>
                            <Input 
                              type="number" 
                              min="1" 
                              placeholder="Unlimited"
                              value={ticket.quantity_available || ''} 
                              onChange={(e) => updateTicket(index, 'quantity_available', e.target.value ? parseInt(e.target.value) : null)} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t flex justify-end">
                  <Button type="button" variant="outline" className="mr-4" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading ? "Creating Event..." : "Create Event"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default CreateEventPage;
