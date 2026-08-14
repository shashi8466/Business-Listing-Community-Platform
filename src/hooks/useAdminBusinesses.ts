import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Business } from "@/types";

export const useAdminBusinesses = () => {
  const [pendingBusinesses, setPendingBusinesses] = useState<Business[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapRow = (b: any): Business => ({
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
    // status is the single source of truth from the DB
    approved: b.status === 'approved',
    active: b.status !== 'suspended' && b.status !== 'rejected',
    services: b.tags || [],
    hours: b.business_hours || {},
    tier: b.membership_tier || 'free',
    createdAt: new Date(b.created_at),
    updatedAt: new Date(b.updated_at),
  });

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      if (data) {
        const mappedResults: Business[] = data.map(mapRow);
        setPendingBusinesses(mappedResults.filter(b => !b.approved && b.active));
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
    fetchBusinesses();
  }, [fetchBusinesses]);

  /**
   * Approve a business listing.
   * Writes to DB, verifies the returned status, then refetches to sync UI.
   */
  const approveBusiness = async (businessId: string): Promise<void> => {
    const { data, error: updateError } = await supabase
      .from("businesses")
      .update({ status: 'approved' })
      .eq("id", businessId)
      .select("id, status")
      .single();

    if (updateError) {
      console.error("approveBusiness DB error:", updateError);
      throw new Error(`Failed to approve business. ${updateError.message}`);
    }

    if (!data || data.status !== 'approved') {
      console.error("approveBusiness: DB did not confirm status change", data);
      throw new Error("Database did not confirm the approval. Please try again.");
    }

    // Refetch from DB — UI always reflects real database state
    await fetchBusinesses();
  };

  /**
   * Reject a business listing (sets status to 'rejected').
   * Writes to DB, verifies, then refetches.
   */
  const rejectBusiness = async (businessId: string): Promise<void> => {
    const { data, error: updateError } = await supabase
      .from("businesses")
      .update({ status: 'rejected' })
      .eq("id", businessId)
      .select("id, status")
      .single();

    if (updateError) {
      console.error("rejectBusiness DB error:", updateError);
      throw new Error(`Failed to reject business. ${updateError.message}`);
    }

    if (!data || data.status !== 'rejected') {
      console.error("rejectBusiness: DB did not confirm status change", data);
      throw new Error("Database did not confirm the rejection. Please try again.");
    }

    await fetchBusinesses();
  };

  /**
   * Suspend (active=false) or Restore (active=true) a business.
   * Writes to DB, verifies, then refetches.
   */
  const toggleActive = async (businessId: string, active: boolean): Promise<void> => {
    const newStatus = active ? 'approved' : 'suspended';

    const { data, error: updateError } = await supabase
      .from("businesses")
      .update({ status: newStatus })
      .eq("id", businessId)
      .select("id, status")
      .single();

    if (updateError) {
      console.error("toggleActive DB error:", updateError);
      const action = active ? "restore" : "suspend";
      throw new Error(`Failed to ${action} business. ${updateError.message}`);
    }

    if (!data || data.status !== newStatus) {
      console.error("toggleActive: DB did not confirm status change", data);
      const action = active ? "restore" : "suspension";
      throw new Error(`Database did not confirm the ${action}. Please try again.`);
    }

    await fetchBusinesses();
  };

  /**
   * Toggle the featured flag on a business.
   * Writes to DB, verifies, then refetches.
   */
  const toggleFeatured = async (businessId: string, featured: boolean): Promise<void> => {
    const { data, error: updateError } = await supabase
      .from("businesses")
      .update({ is_featured: featured })
      .eq("id", businessId)
      .select("id, is_featured")
      .single();

    if (updateError) {
      console.error("toggleFeatured DB error:", updateError);
      throw new Error(`Failed to update featured status. ${updateError.message}`);
    }

    if (!data || data.is_featured !== featured) {
      console.error("toggleFeatured: DB did not confirm change", data);
      throw new Error("Database did not confirm the featured status update. Please try again.");
    }

    await fetchBusinesses();
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

        // Get pending businesses — real count from DB
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
            totalRevenue: 4500,      // Mock data for now
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
