import { Json } from '@/integrations/supabase/types';

export type MembershipTier = 'free' | 'premium' | 'featured';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'pending' | 'trial';
export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type LeadStatus = 'new' | 'viewed' | 'contacted' | 'converted' | 'expired';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type AppRole = 'admin' | 'moderator' | 'user';

export interface MembershipPlan {
  id: string;
  name: string;
  slug: string;
  tier: MembershipTier;
  price_monthly: number;
  price_yearly: number;
  description: string | null;
  features: string[];
  max_leads_per_month: number;
  is_featured_eligible: boolean;
  priority_placement: boolean;
  analytics_access: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string;
  state: string | null;
  zip_code: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  logo_url: string | null;
  cover_image_url: string | null;
  gallery_images: Json;
  business_hours: Json;
  social_links: Json;
  amenities: Json;
  tags: string[] | null;
  status: ListingStatus;
  membership_tier: MembershipTier;
  is_featured: boolean;
  featured_until: string | null;
  is_verified: boolean;
  view_count: number;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  business_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  paypal_subscription_id: string | null;
  paypal_payer_id: string | null;
  created_at: string;
  updated_at: string;
  plan?: MembershipPlan;
}

export interface Payment {
  id: string;
  business_id: string | null;
  subscription_id: string | null;
  user_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_type: string;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  description: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  business_id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  source: string;
  status: LeadStatus;
  is_premium: boolean;
  credit_cost: number;
  viewed_at: string | null;
  contacted_at: string | null;
  converted_at: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface LeadCredits {
  id: string;
  business_id: string;
  total_credits: number;
  used_credits: number;
  monthly_credits: number;
  credits_reset_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessReview {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified: boolean;
  is_featured: boolean;
  helpful_count: number;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  business_id: string;
  event_type: string;
  event_data: Record<string, any>;
  user_agent: string | null;
  ip_hash: string | null;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface ModerationLog {
  id: string;
  moderator_id: string;
  target_type: 'business' | 'review' | 'lead' | 'user';
  target_id: string;
  action: string;
  reason: string | null;
  previous_status: string | null;
  new_status: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

// Dashboard stats
export interface AdminStats {
  totalUsers: number;
  totalBusinesses: number;
  pendingListings: number;
  activeSubscriptions: number;
  totalRevenue: number;
  leadsThisMonth: number;
}

export interface BusinessStats {
  profileViews: number;
  leadsReceived: number;
  leadsConverted: number;
  conversionRate: number;
}
