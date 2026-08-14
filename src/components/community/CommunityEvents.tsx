import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Plus, MapPin, Video, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommunityEvent } from "@/types/community";
import { format } from "date-fns";

interface CommunityEventsProps {
  communityId: string;
  communitySlug: string;
  events: CommunityEvent[];
  canCreateEvent: boolean;
}

const CommunityEvents = ({
  communityId,
  communitySlug,
  events,
  canCreateEvent,
}: CommunityEventsProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Upcoming Events ({events.length})
        </h2>
        {canCreateEvent && (
          <Button className="gap-2" asChild>
            <Link to={`/community/${communitySlug}/events/create`}>
              <Plus className="h-4 w-4" />
              Create Event
            </Link>
          </Button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-xl">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No upcoming events</p>
          {canCreateEvent ? (
            <Button asChild>
              <Link to={`/community/${communitySlug}/events/create`}>Create the First Event</Link>
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Only community moderators can create events
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
