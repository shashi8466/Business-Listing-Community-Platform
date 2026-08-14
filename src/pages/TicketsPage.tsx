import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Ticket, Calendar, MapPin, CheckCircle, ArrowLeft, Video, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useEventTicketing } from "@/hooks/useEventTicketing";
import { format } from "date-fns";

const TicketsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { getUserTickets } = useEventTicketing();

  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    setLoadingTickets(true);
    const { data } = await getUserTickets();
    if (data) {
      setTickets(data);
    }
    setLoadingTickets(false);
  };

  if (authLoading || loadingTickets) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <Ticket className="h-12 w-12 text-primary/40 mb-4" />
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <>
      <Helmet>
        <title>My Tickets | BusinessHub</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Ticket className="h-8 w-8 text-primary" />
                My Tickets
              </h1>
              <p className="text-muted-foreground mt-1">
                View and manage your event tickets
              </p>
            </div>

            <h2 className="text-xl font-semibold mb-4">
              Your Registered Events ({tickets.length})
            </h2>

            {tickets.length === 0 ? (
              <div className="bg-card border rounded-lg p-12 text-center">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No tickets yet</h3>
                <p className="text-muted-foreground mb-6">You haven't registered for any upcoming events.</p>
                <Button asChild>
                  <Link to="/communities">Browse Communities</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="bg-card border border-border rounded-lg p-6 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all hover:shadow-md">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {ticket.community?.name}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {ticket.ticket_type?.name}
                        </Badge>
                      </div>
                      
                      <h3 className="text-lg font-semibold">{ticket.event?.title}</h3>
                      
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                        <div className="flex items-center text-muted-foreground text-sm gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          {ticket.event?.event_date ? format(new Date(ticket.event.event_date), "MMM do, yyyy • h:mm a") : 'TBA'}
                        </div>
                        <div className="flex items-center text-muted-foreground text-sm gap-2">
                          {ticket.event?.is_virtual ? (
                            <><Video className="h-4 w-4 text-primary" /> Virtual Event</>
                          ) : (
                            <><MapPin className="h-4 w-4 text-primary" /> {ticket.event?.location || 'TBA'}</>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm mt-3 pt-3 border-t text-muted-foreground inline-block">
                        Ticket #: <span className="font-mono bg-muted px-2 py-1 rounded text-foreground">{ticket.ticket_number}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600 gap-1 px-3 py-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </Badge>
                      
                      <Button asChild variant="outline" className="w-full md:w-auto gap-2">
                        <Link to={`/tickets/${ticket.id}`}>
                          View Ticket <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default TicketsPage;
