import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EventTicketType {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price: number;
  quantity_available: number | null;
  max_per_user: number;
  status: 'active' | 'paused' | 'sold_out';
}

export interface EventRegistration {
  id: string;
  ticket_number: string;
  event_id: string;
  community_id: string;
  user_id: string;
  ticket_type_id: string;
  payment_id: string | null;
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string | null;
  special_requirements: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in';
  qr_code_data: string;
  created_at: string;
  
  // Joined data for convenience
  event?: any;
  community?: any;
  ticket_type?: EventTicketType;
}

export const useEventTicketing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Create ticket types for an event
  const createTicketType = async (ticketData: Partial<EventTicketType>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('event_tickets')
        .insert([ticketData])
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating ticket type:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch available ticket types for an event
  const getTicketTypes = async (eventId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('event_id', eventId)
        .order('price', { ascending: true });
        
      if (error) throw error;
      return { data: data as EventTicketType[], error: null };
    } catch (err: any) {
      console.error('Error fetching ticket types:', err);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Generate a unique ticket number
  const generateTicketNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `D4D-${timestamp}-${random}`;
  };

  // Register for a free ticket
  const registerFreeTicket = async (
    eventId: string,
    communityId: string,
    ticketTypeId: string,
    attendeeData: { name: string; email: string; phone?: string; requirements?: string }
  ) => {
    if (!user) return { data: null, error: 'Not authenticated' };
    
    setLoading(true);
    setError(null);
    try {
      const ticketNumber = generateTicketNumber();
      const qrCodeData = JSON.stringify({
        t: ticketNumber,
        e: eventId,
        u: user.id
      });

      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          ticket_number: ticketNumber,
          event_id: eventId,
          community_id: communityId,
          user_id: user.id,
          ticket_type_id: ticketTypeId,
          attendee_name: attendeeData.name,
          attendee_email: attendeeData.email,
          attendee_phone: attendeeData.phone || null,
          special_requirements: attendeeData.requirements || null,
          status: 'confirmed',
          qr_code_data: qrCodeData
        })
        .select()
        .single();

      if (error) throw error;
      return { data: data as EventRegistration, error: null };
    } catch (err: any) {
      console.error('Error registering free ticket:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch all tickets for the logged-in user
  const getUserTickets = async () => {
    if (!user) return { data: [], error: 'Not authenticated' };
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          event:community_events(*),
          community:communities(name, city, type),
          ticket_type:event_tickets(name, price)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return { data: data as any[], error: null };
    } catch (err: any) {
      console.error('Error fetching user tickets:', err);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch a specific ticket by ID
  const getTicketDetails = async (ticketId: string) => {
    if (!user) return { data: null, error: 'Not authenticated' };
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          event:community_events(*),
          community:communities(name, city, type),
          ticket_type:event_tickets(name, price),
          payment:payments(status, amount)
        `)
        .eq('id', ticketId)
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      return { data: data as any, error: null };
    } catch (err: any) {
      console.error('Error fetching ticket details:', err);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Register for a paid ticket
  const registerPaidTicket = async (
    eventId: string,
    communityId: string,
    ticketTypeId: string,
    attendeeData: { name: string; email: string; phone?: string; requirements?: string },
    paymentData: { amount: number; transactionId?: string; status: 'completed' | 'pending' }
  ) => {
    if (!user) return { data: null, error: 'Not authenticated' };
    
    setLoading(true);
    setError(null);
    try {
      // 1. Create a payment record in public.payments table
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount: paymentData.amount,
          currency: 'USD',
          status: paymentData.status,
          payment_type: 'one_time',
          paypal_order_id: paymentData.transactionId || `TXN-${Date.now()}`,
          description: `Ticket purchase for Event ID: ${eventId}`,
        })
        .select()
        .single();
        
      if (paymentError) throw paymentError;

      const ticketNumber = generateTicketNumber();
      const qrCodeData = JSON.stringify({
        t: ticketNumber,
        e: eventId,
        u: user.id
      });

      // 2. Create the event registration
      const { data: registration, error: regError } = await supabase
        .from('event_registrations')
        .insert({
          ticket_number: ticketNumber,
          event_id: eventId,
          community_id: communityId,
          user_id: user.id,
          ticket_type_id: ticketTypeId,
          payment_id: payment.id,
          attendee_name: attendeeData.name,
          attendee_email: attendeeData.email,
          attendee_phone: attendeeData.phone || null,
          special_requirements: attendeeData.requirements || null,
          status: paymentData.status === 'completed' ? 'confirmed' : 'pending',
          qr_code_data: qrCodeData
        })
        .select()
        .single();

      if (regError) {
        // clean up the payment if registration failed
        await supabase.from('payments').delete().eq('id', payment.id);
        throw regError;
      }

      return { data: registration as EventRegistration, error: null };
    } catch (err: any) {
      console.error('Error registering paid ticket:', err);
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createTicketType,
    getTicketTypes,
    registerFreeTicket,
    registerPaidTicket,
    getUserTickets,
    getTicketDetails
  };
};
