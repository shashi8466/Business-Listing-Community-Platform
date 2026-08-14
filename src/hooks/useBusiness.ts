import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Business, Review } from "@/types";

// Sample data as fallback
const sampleBusiness: Business = {
  id: "1",
  ownerId: "owner1",
  name: "Spice Symphony",
  slug: "spice-symphony",
  description: "Authentic North Indian cuisine with a modern twist. Family-owned restaurant serving the community for over 15 years. We take pride in using fresh ingredients and traditional recipes passed down through generations.",
  category: "restaurants",
  subcategory: "North Indian",
  address: { street: "123 Main Street", city: "New York", state: "NY", zipCode: "10001" },
  phone: "(212) 555-0123",
  email: "info@spicesymphony.com",
  website: "https://spicesymphony.com",
  images: [
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800&h=600&fit=crop",
  ],
  rating: 4.8,
  reviewCount: 245,
  featured: true,
  verified: true,
  approved: true,
  active: true,
  services: ["Dine-in", "Takeout", "Catering", "Delivery", "Private Events"],
  hours: {
    monday: { open: "11:00 AM", close: "10:00 PM" },
    tuesday: { open: "11:00 AM", close: "10:00 PM" },
    wednesday: { open: "11:00 AM", close: "10:00 PM" },
    thursday: { open: "11:00 AM", close: "10:00 PM" },
    friday: { open: "11:00 AM", close: "11:00 PM" },
    saturday: { open: "11:00 AM", close: "11:00 PM" },
    sunday: { open: "12:00 PM", close: "9:00 PM" },
  },
  views: 1250,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleReviews: Review[] = [
  {
    id: "r1",
    businessId: "1",
    userId: "u1",
    userName: "Priya M.",
    rating: 5,
    title: "Best Indian food in the city!",
    content: "The butter chicken here is absolutely divine. The naan is fresh and fluffy. Staff is super friendly.",
    helpful: 24,
    createdAt: new Date("2024-12-15"),
  },
  {
    id: "r2",
    businessId: "1",
    userId: "u2",
    userName: "Raj K.",
    rating: 5,
    title: "Authentic taste, great ambiance",
    content: "Reminds me of home cooking. The biryani is perfectly spiced and the portions are generous.",
    helpful: 18,
    createdAt: new Date("2024-12-10"),
  },
];

export const useBusiness = (businessId: string | undefined) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusiness = useCallback(async () => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      
      // Attempt to find by ID first, then by slug if not a valid UUID format
      let isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(businessId);
      
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq(isUUID ? 'id' : 'slug', businessId)
        .maybeSingle();
      
      if (businessError) throw businessError;

      if (businessData) {
        const b = businessData;
        setBusiness({
          id: b.id,
          ownerId: b.owner_id,
          name: b.name,
          slug: b.slug,
          description: b.description || '',
          category: b.category,
          subcategory: b.subcategory,
          address: {
            street: b.address || '',
            city: b.city,
            state: b.state || '',
            zipCode: b.zip_code || ''
          },
          phone: b.phone || '',
          email: b.email || '',
          website: b.website,
          images: [b.cover_image_url, ...(b.gallery_images || [])].filter(Boolean),
          rating: Number(b.rating_average) || 0,
          reviewCount: Number(b.rating_count) || 0,
          featured: b.is_featured,
          verified: b.is_verified,
          approved: b.status === 'approved',
          active: b.status !== 'suspended' && b.status !== 'rejected',
          services: b.tags || [],
          hours: b.business_hours || {},
          views: b.view_count || 0,
          createdAt: new Date(b.created_at),
          updatedAt: new Date(b.updated_at)
        });
        
        // Fetch reviews
        const { data: reviewsData } = await supabase
          .from('business_reviews')
          .select('*, users!user_id(display_name, raw_user_meta_data)')
          .eq('business_id', b.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (reviewsData) {
          setReviews(reviewsData.map((r: any) => ({
            id: r.id,
            businessId: r.business_id,
            userId: r.user_id,
            userName: r.users?.raw_user_meta_data?.displayName || r.users?.display_name || 'Anonymous',
            rating: r.rating,
            title: r.title || '',
            content: r.content || '',
            helpful: r.helpful_count || 0,
            createdAt: new Date(r.created_at),
            updatedAt: new Date(r.updated_at)
          })));
        } else {
          setReviews([]);
        }

        // Increment view count via RPC if available, or ignore
        // supabase.rpc('increment_view_count', { row_id: b.id }).catch(() => {});
      } else {
        // Use sample data if not found
        if (businessId === "1" || businessId === "sample") {
          setBusiness(sampleBusiness);
          setReviews(sampleReviews);
        } else {
          setError("Business not found");
          setBusiness(null);
        }
      }
    } catch (err: any) {
      console.error("Error fetching business:", err);
      setError(err.message);
      
      if (businessId === "1" || businessId === "sample") {
        setBusiness(sampleBusiness);
        setReviews(sampleReviews);
      }
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  const addReview = async (reviewData: Omit<Review, "id" | "createdAt" | "helpful">) => {
    if (!business) throw new Error("No business loaded");
    
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error("Must be logged in to review");

    const { data, error } = await supabase.from('business_reviews').insert({
      business_id: business.id,
      user_id: user.id,
      rating: reviewData.rating,
      title: reviewData.title,
      content: reviewData.content,
      status: 'pending' // or approved depending on moderation strategy
    }).select().single();

    if (error) throw error;
    
    // Optimistically update
    if (data) {
      const newReview: Review = {
        id: data.id,
        businessId: data.business_id,
        userId: data.user_id,
        userName: reviewData.userName,
        rating: data.rating,
        title: data.title || '',
        content: data.content || '',
        helpful: 0,
        createdAt: new Date(data.created_at)
      };
      setReviews(prev => [newReview, ...prev]);
    }
  };

  return { business, reviews, loading, error, refetch: fetchBusiness, addReview };
};
