// Types for d4desi platform

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  createdAt: Date;
  role: 'user' | 'business_owner';
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
  services: string[];
  hours: {
    [day: string]: { open: string; close: string } | 'closed';
  };
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
  createdAt: Date;
}

export interface Inquiry {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: Date;
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
] as const;
