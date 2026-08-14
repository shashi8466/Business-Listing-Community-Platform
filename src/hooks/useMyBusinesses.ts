import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Business } from "@/types";

export const useMyBusinesses = (ownerId: string | undefined) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = useCallback(async () => {
    if (!ownerId) {
      setBusinesses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

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
        
        setBusinesses(mappedResults);
      } else {
        setBusinesses([]);
      }
      setError(null);
    } catch (err: any) {
      console.error("Error fetching user businesses:", err);
      setError(err.message);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      fetchBusinesses();
    }
    return () => {
      mounted = false;
    };
  }, [fetchBusinesses]);

  const deleteBusiness = async (businessId: string) => {
    const { error } = await supabase
      .from("businesses")
      .delete()
      .eq("id", businessId);
      
    if (error) throw error;
    
    setBusinesses((prev) => prev.filter((b) => b.id !== businessId));
  };

  const updateBusiness = async (businessId: string, data: Partial<Business>) => {
    // Map frontend fields to Supabase schema fields
    const mappedData: any = {};
    if (data.name) mappedData.name = data.name;
    if (data.description) mappedData.description = data.description;
    if (data.category) mappedData.category = data.category;
    if (data.subcategory) mappedData.subcategory = data.subcategory;
    if (data.phone) mappedData.phone = data.phone;
    if (data.email) mappedData.email = data.email;
    if (data.website) mappedData.website = data.website;
    if (data.address) {
      mappedData.address = data.address.street;
      mappedData.city = data.address.city;
      mappedData.state = data.address.state;
      mappedData.zip_code = data.address.zipCode;
    }
    if (data.images && data.images.length > 0) {
      mappedData.cover_image_url = data.images[0];
      mappedData.gallery_images = data.images.slice(1);
    }
    if (data.services) mappedData.tags = data.services;
    if (data.hours) mappedData.business_hours = data.hours;

    const { error } = await supabase
      .from("businesses")
      .update(mappedData)
      .eq("id", businessId);
      
    if (error) throw error;
    
    setBusinesses((prev) =>
      prev.map((b) => (b.id === businessId ? { ...b, ...data } : b))
    );
  };

  return { businesses, loading, error, deleteBusiness, updateBusiness, refetch: fetchBusinesses };
};
