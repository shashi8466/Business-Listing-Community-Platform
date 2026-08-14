import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, MapPin, Ticket, User, Video, Info, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useEventTicketing } from "@/hooks/useEventTicketing";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const TicketDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTicketDetails } = useEventTicketing();
  const { toast } = useToast();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      loadTicket();
    }
  }, [id, user]);

  const loadTicket = async () => {
    if (!id) return;
    setLoading(true);
    const { data } = await getTicketDetails(id);
    if (data) {
      setTicket(data);
    }
    setLoading(false);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "Ticket link copied to clipboard.",
    });
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <Ticket className="h-12 w-12 text-primary/40 mb-4" />
          <p className="text-muted-foreground">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center text-center">
          <div>
            <h1 className="text-2xl font-bold mb-4">Ticket Not Found</h1>
            <p className="text-muted-foreground mb-6">This ticket doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => navigate("/tickets")}>Back to My Tickets</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(ticket.qr_code_data)}`;

  return (
    <>
      <Helmet>
        <title>Ticket: {ticket.event?.title} | BusinessHub</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-3xl">
            <Button variant="ghost" onClick={() => navigate("/tickets")} className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Tickets
            </Button>

            {/* Top Banner style */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm mb-6">
              <div className="bg-gradient-to-r from-primary/80 to-primary/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
                <div>
                  <Badge variant="outline" className="text-white border-white/40 mb-2 uppercase tracking-wide text-xs">
                    {ticket.community?.name || 'Community'}
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-bold">{ticket.event?.title}</h1>
                  <p className="text-sm opacity-90 mt-1">
                    {ticket.event?.event_date ? format(new Date(ticket.event.event_date), "EEEE, MMMM d, yyyy • h:mm a") : 'TBA'}
                  </p>
                </div>
                <Badge className="bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-1 uppercase text-sm border-0">
                  {ticket.status === 'confirmed' ? 'ACTIVE' : ticket.status.toUpperCase()}
                </Badge>
              </div>

              <div className="flex flex-col md:flex-row">
                {/* Left Side: Ticket Visual & QR */}
                <div className="p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border min-w-[300px] bg-muted/10">
                  <div className="bg-white p-4 rounded-xl shadow-md mb-4 inline-block border border-border">
                    <img src={qrCodeUrl} alt="Ticket QR Code" className="w-44 h-44" />
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-1">Scan this QR code at the event entrance</p>
                  
                  <div className="text-center mt-3 mb-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Ticket Number</p>
                    <p className="font-mono font-bold text-base bg-muted px-3 py-1.5 rounded mt-1 border border-border/50 text-foreground">
                      {ticket.ticket_number}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => window.print()}>
                      <Download className="h-4 w-4" /> Download
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={handleShare}>
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                  </div>
                </div>

                {/* Right Side: Details */}
                <div className="p-8 flex-1 space-y-6">
                  {/* Section 1: Event Details */}
                  <div>
                    <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-3 pb-1 border-b border-border/50">Event Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2.5 text-sm">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Location</p>
                          {ticket.event?.is_virtual ? (
                            <a href={ticket.event.virtual_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              Join Meeting Link (Virtual)
                            </a>
                          ) : (
                            <p className="text-muted-foreground">{ticket.event?.location || 'TBA'}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-sm mt-3">
                        <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Date & Time</p>
                          <p className="text-muted-foreground">
                            {ticket.event?.event_date ? format(new Date(ticket.event.event_date), "EEEE, MMMM d, yyyy 'at' h:mm a") : 'TBA'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Ticket Information */}
                  <div>
                    <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-3 pb-1 border-b border-border/50">Ticket Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Ticket Type</p>
                        <p className="font-medium text-foreground">{ticket.ticket_type?.name || 'General Admission'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-medium text-primary">
                          {ticket.ticket_type?.price === 0 ? 'Free' : `$${ticket.ticket_type?.price}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Purchased Date</p>
                        <p className="font-medium text-foreground">
                          {ticket.created_at ? format(new Date(ticket.created_at), "MMM d, yyyy") : 'TBA'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payment Status</p>
                        <Badge className={`${ticket.ticket_type?.price === 0 ? 'bg-secondary text-secondary-foreground hover:bg-secondary' : 'bg-green-500 hover:bg-green-600 text-white'} border-0 px-2 py-0 h-5 mt-0.5 text-xs font-semibold`}>
                          {ticket.ticket_type?.price === 0 ? 'FREE' : 'COMPLETED'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Registration Details */}
                  <div>
                    <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-3 pb-1 border-b border-border/50">Registration Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Attendee Name</p>
                        <p className="font-medium text-foreground">{ticket.attendee_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Attendee Email</p>
                        <p className="font-medium text-foreground truncate">{ticket.attendee_email}</p>
                      </div>
                      {ticket.attendee_phone && (
                        <div>
                          <p className="text-muted-foreground">Attendee Phone</p>
                          <p className="font-medium text-foreground">{ticket.attendee_phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section: About Event description */}
              {ticket.event?.description && (
                <div className="border-t border-border p-6 md:p-8 bg-muted/5">
                  <h3 className="font-bold text-foreground text-base mb-2">About This Event</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line mb-6">
                    {ticket.event.description}
                  </p>
                  <div className="flex justify-start">
                    <Button asChild className="gap-2">
                      <Link to={`/community/event/${ticket.event.id}`}>
                        View Event Details
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default TicketDetailsPage;
