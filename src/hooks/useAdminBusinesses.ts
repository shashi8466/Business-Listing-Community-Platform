import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Business } from "@/types";

export const useAdminBusinesses = () => {
  const [pendingBusinesses, setPendingBusinesses] = useState<Business[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from("businesses")
        .select("*")
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

        setPendingBusinesses(mappedResults.filter(b => !b.approved && b.active)); // pending status mapping
        setAllBusinesses(mappedResults);
      }
      setError(null);
    } catch (err: any) {
      console.error("Error fetching admin businesses:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    if (mounted) fetchBusinesses();
    return () => { mounted = false; };
  }, [fetchBusinesses]);

  const approveBusiness = async (businessId: string) => {
    const { error, data } = await supabase
      .from("businesses")
      .update({ status: 'approved' })
      .eq("id", businessId)
      .select()
      .single();
      
    if (error) throw error;
    
    setPendingBusinesses((prev) => prev.filter((b) => b.id !== businessId));
    setAllBusinesses((prev) =>
      prev.map((b) => (b.id === businessId ? { ...b, approved: true, active: true } : b))
    );
  };

  const rejectBusiness = async (businessId: string) => {
    // Or delete, but setting to rejected is safer
    const { error } = await supabase
      .from("businesses")
      .update({ status: 'rejected' })
      .eq("id", businessId)
      .select()
      .single();
      
    if (error) throw error;
    
    setPendingBusinesses((prev) => prev.filter((b) => b.id !== businessId));
    setAllBusinesses((prev) => prev.map((b) => (b.id === businessId ? { ...b, approved: false, active: false } : b)));
  };

  const toggleActive = async (businessId: string, active: boolean) => {
    const status = active ? 'approved' : 'suspended';
    const { error } = await supabase
      .from("businesses")
      .update({ status })
      .eq("id", businessId)
      .select()
      .single();
      
    if (error) throw error;
    
    setAllBusinesses((prev) =>
      prev.map((b) => (b.id === businessId ? { ...b, active } : b))
    );
  };

  const toggleFeatured = async (businessId: string, featured: boolean) => {
    const { error } = await supabase
      .from("businesses")
      .update({ is_featured: featured })
      .eq("id", businessId)
      .select()
      .single();
      
    if (error) throw error;
    
    setAllBusinesses((prev) =>
      prev.map((b) => (b.id === businessId ? { ...b, featured } : b))
    );
  };

  return {
    pendingBusinesses,
    allBusinesses,
    loading,
    error,
    approveBusiness,
    rejectBusiness,
    toggleActive,
    toggleFeatured,
    refetch: fetchBusinesses,
  };
};

export const useAdminStats = () => {
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    pendingListings: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    leadsThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Get total businesses
        const { count: totalBusinesses } = await supabase
          .from("businesses")
          .select("*", { count: 'exact', head: true });
          
        // Get pending businesses
        const { count: pendingListings } = await supabase
          .from("businesses")
          .select("*", { count: 'exact', head: true })
          .eq('status', 'pending');
          
        // Get leads this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { count: leadsThisMonth } = await supabase
          .from("leads")
          .select("*", { count: 'exact', head: true })
          .gte('created_at', startOfMonth.toISOString());
          
        if (mounted) {
          setStats({
            totalBusinesses: totalBusinesses || 0,
            pendingListings: pendingListings || 0,
            activeSubscriptions: 15, // Mock data for now
            totalRevenue: 4500, // Mock data for now
            leadsThisMonth: leadsThisMonth || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();
    return () => { mounted = false; };
  }, []);

  return { stats, loading };
};
