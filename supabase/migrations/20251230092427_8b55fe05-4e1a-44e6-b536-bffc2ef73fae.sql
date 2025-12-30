-- =============================================
-- MARKETPLACE EXPANSION DATABASE SCHEMA
-- =============================================

-- 1. Create enums for marketplace
CREATE TYPE public.membership_tier AS ENUM ('free', 'premium', 'featured');
CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'expired', 'pending', 'trial');
CREATE TYPE public.listing_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE public.lead_status AS ENUM ('new', 'viewed', 'contacted', 'converted', 'expired');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. User roles table (for admin access)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'moderator')
  )
$$;

-- 4. Membership plans table
CREATE TABLE public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tier membership_tier NOT NULL DEFAULT 'free',
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  max_leads_per_month INTEGER DEFAULT 0,
  is_featured_eligible BOOLEAN DEFAULT false,
  priority_placement BOOLEAN DEFAULT false,
  analytics_access BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

-- 5. Businesses table
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  logo_url TEXT,
  cover_image_url TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  business_hours JSONB DEFAULT '{}'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  amenities JSONB DEFAULT '[]'::jsonb,
  tags TEXT[],
  status listing_status DEFAULT 'pending',
  membership_tier membership_tier DEFAULT 'free',
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  rating_average DECIMAL(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX idx_businesses_city ON public.businesses(city);
CREATE INDEX idx_businesses_category ON public.businesses(category);
CREATE INDEX idx_businesses_status ON public.businesses(status);
CREATE INDEX idx_businesses_tier ON public.businesses(membership_tier);
CREATE INDEX idx_businesses_featured ON public.businesses(is_featured) WHERE is_featured = true;

-- 6. Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.membership_plans(id) NOT NULL,
  status subscription_status DEFAULT 'pending',
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  paypal_subscription_id TEXT,
  paypal_payer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_subscriptions_business ON public.subscriptions(business_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- 7. Payments/Transactions table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status payment_status DEFAULT 'pending',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('subscription', 'featured_listing', 'lead_credits', 'one_time')),
  paypal_order_id TEXT,
  paypal_capture_id TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_payments_business ON public.payments(business_id);
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- 8. Lead credits table
CREATE TABLE public.lead_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_credits INTEGER DEFAULT 0,
  used_credits INTEGER DEFAULT 0,
  monthly_credits INTEGER DEFAULT 0,
  credits_reset_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.lead_credits ENABLE ROW LEVEL SECURITY;

-- 9. Leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  source TEXT DEFAULT 'website',
  status lead_status DEFAULT 'new',
  is_premium BOOLEAN DEFAULT false,
  credit_cost INTEGER DEFAULT 1,
  viewed_at TIMESTAMP WITH TIME ZONE,
  contacted_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_leads_business ON public.leads(business_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created ON public.leads(created_at DESC);

-- 10. Business analytics events
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_analytics_business ON public.analytics_events(business_id);
CREATE INDEX idx_analytics_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_created ON public.analytics_events(created_at DESC);

-- 11. Business reviews
CREATE TABLE public.business_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  status listing_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(business_id, user_id)
);

ALTER TABLE public.business_reviews ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_reviews_business ON public.business_reviews(business_id);
CREATE INDEX idx_reviews_user ON public.business_reviews(user_id);

-- 12. Moderation logs
CREATE TABLE public.moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('business', 'review', 'lead', 'user')),
  target_id UUID NOT NULL,
  action TEXT NOT NULL,
  reason TEXT,
  previous_status TEXT,
  new_status TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_moderation_target ON public.moderation_logs(target_type, target_id);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- Membership plans policies (public read)
CREATE POLICY "Anyone can view active plans" ON public.membership_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON public.membership_plans
  FOR ALL USING (public.is_admin(auth.uid()));

-- Businesses policies
CREATE POLICY "Anyone can view approved businesses" ON public.businesses
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Owners can view their own businesses" ON public.businesses
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create businesses" ON public.businesses
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their businesses" ON public.businesses
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all businesses" ON public.businesses
  FOR ALL USING (public.is_admin(auth.uid()));

-- Subscriptions policies
CREATE POLICY "Users can view their business subscriptions" ON public.subscriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
  );

CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
  FOR ALL USING (public.is_admin(auth.uid()));

-- Payments policies
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage payments" ON public.payments
  FOR ALL USING (public.is_admin(auth.uid()));

-- Lead credits policies
CREATE POLICY "Business owners can view their credits" ON public.lead_credits
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
  );

CREATE POLICY "Admins can manage credits" ON public.lead_credits
  FOR ALL USING (public.is_admin(auth.uid()));

-- Leads policies
CREATE POLICY "Business owners can view their leads" ON public.leads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
  );

CREATE POLICY "Anyone can create leads" ON public.leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage leads" ON public.leads
  FOR ALL USING (public.is_admin(auth.uid()));

-- Analytics policies
CREATE POLICY "Business owners can view their analytics" ON public.analytics_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
  );

CREATE POLICY "Anyone can create analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all analytics" ON public.analytics_events
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Reviews policies
CREATE POLICY "Anyone can view approved reviews" ON public.business_reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Authenticated users can create reviews" ON public.business_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.business_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage reviews" ON public.business_reviews
  FOR ALL USING (public.is_admin(auth.uid()));

-- Moderation logs policies
CREATE POLICY "Admins can manage moderation logs" ON public.moderation_logs
  FOR ALL USING (public.is_admin(auth.uid()));

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamp trigger
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lead_credits_updated_at
  BEFORE UPDATE ON public.lead_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.business_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.membership_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED DEFAULT MEMBERSHIP PLANS
-- =============================================

INSERT INTO public.membership_plans (name, slug, tier, price_monthly, price_yearly, description, features, max_leads_per_month, is_featured_eligible, priority_placement, analytics_access) VALUES
('Free', 'free', 'free', 0, 0, 'Get started with basic listing features', '["Basic business profile", "Up to 5 photos", "Contact form", "3 leads per month"]', 3, false, false, false),
('Premium', 'premium', 'premium', 29.99, 299.99, 'Grow your business with advanced features', '["Everything in Free", "Unlimited photos", "Priority support", "25 leads per month", "Basic analytics", "Social media links", "Business hours display"]', 25, false, false, true),
('Featured', 'featured', 'featured', 99.99, 999.99, 'Maximum visibility and premium placement', '["Everything in Premium", "Featured badge", "Priority placement in search", "100 leads per month", "Advanced analytics", "Highlighted listing", "Direct messaging"]', 100, true, true, true);