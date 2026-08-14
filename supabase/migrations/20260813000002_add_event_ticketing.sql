-- ==========================================
-- EVENT TICKETING & REGISTRATIONS EXTENSION
-- ==========================================

-- 1. Modify the Payments enum to support event tickets
ALTER TYPE payment_type ADD VALUE IF NOT EXISTS 'event_ticket';

-- 2. Create the Event Tickets table
CREATE TABLE IF NOT EXISTS public.event_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity_available INTEGER, -- NULL means unlimited
    max_per_user INTEGER DEFAULT 1,
    sale_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
    sale_end TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'sold_out')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create the Event Registrations (The generated ticket for the user)
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL, -- The unique readable ticket number (e.g. D4D-2026-000123)
    event_id UUID NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ticket_type_id UUID NOT NULL REFERENCES public.event_tickets(id) ON DELETE RESTRICT,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL, -- Null if free
    
    -- Registration form fields
    attendee_name TEXT NOT NULL,
    attendee_email TEXT NOT NULL,
    attendee_phone TEXT,
    special_requirements TEXT,
    
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'checked_in')),
    qr_code_data TEXT NOT NULL, -- Content representing the QR payload for scanning
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Alter payments to reference the registration (optional but good for tracking)
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS event_registration_id UUID REFERENCES public.event_registrations(id) ON DELETE SET NULL;

-- 5. Enable RLS
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- =====================
-- RLS POLICIES - EVENT TICKETS
-- =====================

-- Anyone can view available tickets for an event
CREATE POLICY "Tickets are viewable by everyone" ON public.event_tickets
    FOR SELECT USING (true);

-- Only Community Owners and Admins can create/update tickets
CREATE POLICY "Community admins can manage tickets" ON public.event_tickets
    FOR ALL TO authenticated
    USING (public.is_community_moderator(auth.uid(), (SELECT community_id FROM public.community_events WHERE id = event_id)));

-- =====================
-- RLS POLICIES - EVENT REGISTRATIONS
-- =====================

-- Users can view their own registrations (My Tickets)
CREATE POLICY "Users can view their own tickets" ON public.event_registrations
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Community Admins/Event Creators can view all attendees for their events
CREATE POLICY "Admins can view all event attendees" ON public.event_registrations
    FOR SELECT TO authenticated
    USING (public.is_community_moderator(auth.uid(), community_id) OR (SELECT user_id FROM public.community_events WHERE id = event_id) = auth.uid());

-- Authenticated users can register for an event (create a ticket)
CREATE POLICY "Users can register for tickets" ON public.event_registrations
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can cancel their own registrations
CREATE POLICY "Users can cancel their tickets" ON public.event_registrations
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (status IN ('cancelled', 'pending'));

-- Admins can update any registration status (e.g. check-in, cancel)
CREATE POLICY "Admins can manage registrations" ON public.event_registrations
    FOR UPDATE TO authenticated
    USING (public.is_community_moderator(auth.uid(), community_id));

-- =====================
-- INDEXES & TRIGGERS
-- =====================

CREATE INDEX idx_event_tickets_event ON public.event_tickets(event_id);
CREATE INDEX idx_event_registrations_user ON public.event_registrations(user_id);
CREATE INDEX idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX idx_event_registrations_community ON public.event_registrations(community_id);

CREATE TRIGGER update_event_tickets_updated_at
    BEFORE UPDATE ON public.event_tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at
    BEFORE UPDATE ON public.event_registrations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
