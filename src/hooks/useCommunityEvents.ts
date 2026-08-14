import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CommunityEvent, EventRsvp } from '@/types/community';
import { useAuth } from '@/contexts/AuthContext';

export const useCommunityEvents = (communityId: string | undefined) => {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!communityId) {
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('community_events')
          .select('*')
          .eq('community_id', communityId)
          .gte('event_date', new Date().toISOString())
          .order('event_date', { ascending: true });

        if (error) throw error;
        setEvents((data as CommunityEvent[]) || []);
      } catch (err: any) {
        console.error('Error fetching events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [communityId]);

  const createEvent = async (eventData: {
    title: string;
    description?: string;
    event_date: string;
    end_date?: string;
    location?: string;
    is_virtual?: boolean;
    virtual_link?: string;
    max_attendees?: number;
    is_paid_event?: boolean;
    ticket_price?: number;
    currency?: string;
    requires_registration?: boolean;
    total_tickets?: number | null;
    ticket_types?: any[];
  }) => {
    if (!communityId) return { error: 'No community' };

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('community_events')
      .insert({
        ...eventData,
        community_id: communityId,
        user_id: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      setEvents(prev => [...prev, data as CommunityEvent].sort(
        (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      ));
    }

    return { data, error: error?.message };
  };

  return { events, loading, error, createEvent };
};

export const useEvent = (eventId: string | undefined) => {
  const { user } = useAuth();
  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [rsvps, setRsvps] = useState<EventRsvp[]>([]);
  const [userRsvp, setUserRsvp] = useState<EventRsvp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        setLoading(true);

        // Fetch event
        const { data: eventData, error: eventError } = await supabase
          .from('community_events')
          .select('*')
          .eq('id', eventId)
          .maybeSingle();

        if (eventError) throw eventError;
        setEvent(eventData as CommunityEvent);

        // Fetch RSVPs
        const { data: rsvpData, error: rsvpError } = await supabase
          .from('event_rsvps')
          .select('*')
          .eq('event_id', eventId);

        if (rsvpError) throw rsvpError;
        setRsvps((rsvpData as EventRsvp[]) || []);

        // Check user's RSVP
        if (user && rsvpData) {
          const myRsvp = rsvpData.find(r => r.user_id === user.id);
          setUserRsvp(myRsvp as EventRsvp || null);
        } else {
          setUserRsvp(null);
        }
      } catch (err: any) {
        console.error('Error fetching event:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, user]);

  const updateRsvp = async (status: 'going' | 'interested' | 'not_going') => {
    if (!eventId) return { error: 'No event' };

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return { error: 'Not authenticated' };

    if (userRsvp) {
      // Update existing RSVP
      const { data, error } = await supabase
        .from('event_rsvps')
        .update({ status })
        .eq('id', userRsvp.id)
        .select()
        .single();

      if (!error && data) {
        setUserRsvp(data as EventRsvp);
        setRsvps(prev =>
          prev.map(r => r.id === data.id ? data as EventRsvp : r)
        );
      }

      return { error: error?.message };
    } else {
      // Create new RSVP
      const { data, error } = await supabase
        .from('event_rsvps')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status,
        })
        .select()
        .single();

      if (!error && data) {
        setUserRsvp(data as EventRsvp);
        setRsvps(prev => [...prev, data as EventRsvp]);
      }

      return { error: error?.message };
    }
  };

  const cancelRsvp = async () => {
    if (!userRsvp) return { error: 'No RSVP to cancel' };

    const { error } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('id', userRsvp.id);

    if (!error) {
      setRsvps(prev => prev.filter(r => r.id !== userRsvp.id));
      setUserRsvp(null);
    }

    return { error: error?.message };
  };

  return { event, rsvps, userRsvp, loading, error, updateRsvp, cancelRsvp };
};
