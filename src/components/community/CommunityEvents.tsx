import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Plus, MapPin, Video, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CommunityEvent } from "@/types/community";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";

interface CommunityEventsProps {
  communityId: string;
  events: CommunityEvent[];
  isMember: boolean;
  onCreateEvent: (data: {
    title: string;
    description?: string;
    event_date: string;
    location?: string;
    is_virtual?: boolean;
    virtual_link?: string;
  }) => Promise<{ error?: string }>;
}

const CommunityEvents = ({
  communityId,
  events,
  isMember,
  onCreateEvent,
}: CommunityEventsProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    is_virtual: false,
    virtual_link: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.event_date) return;

    setIsSubmitting(true);
    const { error } = await onCreateEvent({
      title: formData.title,
      description: formData.description || undefined,
      event_date: new Date(formData.event_date).toISOString(),
      location: formData.location || undefined,
      is_virtual: formData.is_virtual,
      virtual_link: formData.virtual_link || undefined,
    });
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    } else {
      toast({ title: "Event created!" });
      setFormData({
        title: "",
        description: "",
        event_date: "",
        location: "",
        is_virtual: false,
        virtual_link: "",
      });
      setIsDialogOpen(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Upcoming Events ({events.length})
        </h2>
        {isMember && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    placeholder="Event title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Event description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="event_date">Date & Time</Label>
                  <Input
                    id="event_date"
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, event_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_virtual">Virtual Event</Label>
                  <Switch
                    id="is_virtual"
                    checked={formData.is_virtual}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_virtual: checked }))}
                  />
                </div>
                {formData.is_virtual ? (
                  <div>
                    <Label htmlFor="virtual_link">Meeting Link</Label>
                    <Input
                      id="virtual_link"
                      placeholder="https://zoom.us/..."
                      value={formData.virtual_link}
                      onChange={(e) => setFormData((prev) => ({ ...prev, virtual_link: e.target.value }))}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Event location"
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Event"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No upcoming events</p>
          {isMember ? (
            <Button onClick={() => setIsDialogOpen(true)}>
              Create the First Event
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Join the community to create events
            </p>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/community/event/${event.id}`}
              className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/50 transition-all"
            >
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-32 object-cover"
                />
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 text-sm text-primary mb-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(event.event_date), "EEE, MMM d • h:mm a")}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {event.is_virtual ? (
                    <span className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      Virtual Event
                    </span>
                  ) : event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {event.rsvp_count} going
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityEvents;
