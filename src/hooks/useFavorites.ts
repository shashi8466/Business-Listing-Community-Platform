import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Business } from "@/types";

export const useFavorites = () => {
  const { userProfile } = useAuth();
  const [favorites, setFavorites] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!userProfile?.id) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Fetch favorites for user
      const { data: favs, error: favError } = await supabase
        .from('user_favorites')
        .select('business_id')
        .eq('user_id', userProfile.id);
        
      if (favError) {
        // If table doesn't exist yet, just return empty
        if (favError.code === '42P01') {
          setFavorites([]);
          return;
        }
        throw favError;
      }
      
      if (!favs || favs.length === 0) {
        setFavorites([]);
        return;
      }
      
      const businessIds = favs.map(f => f.business_id);
      
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .in('id', businessIds);
        
      if (error) throw error;
      
      if (data) {
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
        
        setFavorites(mappedResults);
      }
      setError(null);
    } catch (err: any) {
      console.error("Error fetching favorites:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return { favorites, loading, error, refetch: fetchFavorites };
};
