import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Business } from "@/types";

interface UseBusinessesOptions {
  category?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  featured?: boolean;
  searchQuery?: string;
  limitCount?: number;
  ownerId?: string;
}

// Sample data as fallback
const sampleBusinesses: Business[] = [
  {
    id: "1",
    ownerId: "owner1",
    name: "Spice Symphony",
    slug: "spice-symphony",
    description: "Authentic North Indian cuisine with a modern twist. Family-owned restaurant serving the community for over 15 years.",
    category: "restaurants",
    address: { street: "123 Main St", city: "New York", state: "NY", zipCode: "10001" },
    phone: "(212) 555-0123",
    email: "info@spicesymphony.com",
    website: "https://spicesymphony.com",
    images: ["https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop"],
    rating: 4.8,
    reviewCount: 245,
    featured: true,
    verified: true,
    approved: true,
    active: true,
    services: ["Dine-in", "Takeout", "Catering"],
    hours: { monday: { open: "11:00", close: "22:00" } },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    ownerId: "owner2",
    name: "Sharma Real Estate Group",
    slug: "sharma-real-estate",
    description: "Full-service real estate agency specializing in residential and commercial properties.",
    category: "real-estate",
    address: { street: "456 Oak Ave", city: "Los Angeles", state: "CA", zipCode: "90001" },
    phone: "(310) 555-0456",
    email: "info@sharmarealty.com",
    images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"],
    rating: 4.9,
    reviewCount: 182,
    featured: true,
    verified: true,
    approved: true,
    active: true,
    services: ["Buying", "Selling", "Property Management"],
    hours: { monday: { open: "09:00", close: "18:00" } },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "3",
    ownerId: "owner3",
    name: "Vedic Tutors Academy",
    slug: "vedic-tutors",
    description: "Expert tutoring in Math, Science, and SAT/ACT prep.",
    category: "tutors",
    address: { street: "789 Elm St", city: "Houston", state: "TX", zipCode: "77001" },
    phone: "(713) 555-0789",
    email: "info@vedictutors.com",
    images: ["https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop"],
    rating: 4.7,
    reviewCount: 156,
    featured: false,
    verified: true,
    approved: true,
    active: true,
    services: ["Math", "Science", "SAT Prep"],
    hours: { monday: { open: "15:00", close: "21:00" } },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const useBusinesses = (options: UseBusinessesOptions = {}) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        
        let query = supabase.from('businesses').select('*');
        
        // Apply filters
        if (!options.ownerId) {
          query = query.eq('status', 'approved');
        }
        
        if (options.ownerId) {
          query = query.eq('owner_id', options.ownerId);
        }
        
        if (options.category) {
          query = query.eq('category', options.category);
        }
        
        if (options.city) {
          query = query.ilike('city', options.city);
        }
        
        if (options.featured) {
          query = query.eq('is_featured', true);
        }
        
        if (options.limitCount) {
          query = query.limit(options.limitCount);
        }

        // Search query requires an OR condition across multiple text fields
        if (options.searchQuery) {
          query = query.or(`name.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%,category.ilike.%${options.searchQuery}%`);
        }
        
        // Execute query
        const { data, error: fetchError } = await query;
        
        if (fetchError) throw fetchError;
        
        if (data && data.length > 0) {
          const mappedResults: Business[] = data.map((b: any) => ({
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
            createdAt: new Date(b.created_at),
            updatedAt: new Date(b.updated_at)
          }));
          
          // Sort by rating desc
          mappedResults.sort((a, b) => b.rating - a.rating);
          
          if (mounted) {
            setBusinesses(mappedResults);
            setError(null);
          }
        } else {
          // Use sample data if Supabase is empty
          if (mounted && !options.ownerId) {
            let sampleResults = [...sampleBusinesses];
            
            if (options.category) {
              sampleResults = sampleResults.filter(b => b.category === options.category);
            }
            if (options.city) {
              sampleResults = sampleResults.filter(b => b.address.city.toLowerCase() === options.city?.toLowerCase());
            }
            if (options.featured) {
              sampleResults = sampleResults.filter(b => b.featured);
            }
            if (options.searchQuery) {
              const searchLower = options.searchQuery.toLowerCase();
              sampleResults = sampleResults.filter(b => 
                b.name.toLowerCase().includes(searchLower) ||
                b.description.toLowerCase().includes(searchLower)
              );
            }
            if (options.limitCount) {
              sampleResults = sampleResults.slice(0, options.limitCount);
            }
            
            setBusinesses(sampleResults);
            setError(null);
          } else if (mounted) {
             setBusinesses([]);
          }
        }
        
      } catch (err: any) {
        console.error("Error fetching businesses from Supabase:", err);
        if (mounted) {
          setError(err.message);
          // Fallback to sample data on error
          setBusinesses(sampleBusinesses);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchBusinesses();
    
    return () => {
      mounted = false;
    };
  }, [options.category, options.city, options.featured, options.searchQuery, options.limitCount, options.ownerId]);

  return { businesses, loading, error };
};
