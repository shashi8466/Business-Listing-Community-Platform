// Types for BusinessHub platform

export type UserRole = 'user' | 'business' | 'admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  city?: string;
  state?: string;
  zip?: string;
  zipCode?: string;
  createdAt: Date;
  role: UserRole;
  favorites?: string[]; // Array of business IDs
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  email: string;
  website?: string;
  images: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  verified: boolean;
  approved: boolean;
  active: boolean;
  services: string[];
  serviceAreas?: string[];
  hours: {
    [day: string]: { open: string; close: string } | 'closed';
  };
  views?: number;
  tier?: string; // maps from membership_tier in DB
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  ownerReply?: {
    content: string;
    createdAt: Date;
  };
  reported?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export type LeadStatus = 'pending' | 'contacted' | 'closed' | 'spam';

export interface Lead {
  id: string;
  businessId: string;
  businessName: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: LeadStatus;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface SavedBusiness {
  id: string;
  userId: string;
  businessId: string;
  savedAt: Date;
}

export const CATEGORIES = [
  { id: 'tutors', name: 'Tutors & Coaching', icon: 'GraduationCap' },
  { id: 'restaurants', name: 'Restaurants & Food', icon: 'UtensilsCrossed' },
  { id: 'real-estate', name: 'Real Estate', icon: 'Home' },
  { id: 'legal', name: 'Legal & Finance', icon: 'Scale' },
  { id: 'events', name: 'Events & Entertainment', icon: 'PartyPopper' },
  { id: 'health', name: 'Health & Wellness', icon: 'Heart' },
  { id: 'home-services', name: 'Home Services', icon: 'Wrench' },
  { id: 'jobs', name: 'Jobs & Professional', icon: 'Briefcase' },
  { id: 'community', name: 'Community & Religious', icon: 'Users' },
  { id: 'beauty', name: 'Beauty & Salon', icon: 'Sparkles' },
  { id: 'travel', name: 'Travel & Transport', icon: 'Plane' },
  { id: 'grocery', name: 'Grocery & Stores', icon: 'ShoppingCart' },
] as const;

export const US_CITIES = [
  { city: 'New York', state: 'NY' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Houston', state: 'TX' },
  { city: 'San Francisco', state: 'CA' },
  { city: 'Dallas', state: 'TX' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Boston', state: 'MA' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Washington', state: 'DC' },
  { city: 'Denver', state: 'CO' },
  { city: 'San Jose', state: 'CA' },
  { city: 'Austin', state: 'TX' },
  { city: 'Philadelphia', state: 'PA' },
  { city: 'San Diego', state: 'CA' },
  { city: 'Miami', state: 'FL' },
  { city: 'Detroit', state: 'MI' },
  { city: 'Minneapolis', state: 'MN' },
  { city: 'Charlotte', state: 'NC' },
] as const;

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
] as const;
