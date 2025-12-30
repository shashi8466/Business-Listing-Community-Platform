import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MembershipPlan, Business, Subscription, Lead, Payment, AdminStats, ListingStatus } from '@/types/marketplace';
import { useAuth } from '@/contexts/AuthContext';

// Hook for membership plans
export function useMembershipPlans() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('membership_plans')
          .select('*')
          .eq('is_active', true)
          .order('price_monthly', { ascending: true });

        if (error) throw error;
        
        const formattedPlans = (data || []).map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features as string || '[]')
        }));
        
        setPlans(formattedPlans);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return { plans, loading, error };
}

// Hook for user's businesses
export function useUserBusinesses() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setBusinesses([]);
      setLoading(false);
      return;
    }

    const fetchBusinesses = async () => {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', user.uid)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBusinesses((data || []) as Business[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [user]);

  return { businesses, loading, error, refetch: () => {} };
}

// Hook for admin stats
export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch businesses count
        const { count: businessCount } = await supabase
          .from('businesses')
          .select('*', { count: 'exact', head: true });

        // Fetch pending listings
        const { count: pendingCount } = await supabase
          .from('businesses')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Fetch active subscriptions
        const { count: subscriptionCount } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Fetch total revenue
        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .eq('status', 'completed');

        const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        // Fetch leads this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: leadsCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth.toISOString());

        setStats({
          totalUsers: 0, // Would need auth admin access
          totalBusinesses: businessCount || 0,
          pendingListings: pendingCount || 0,
          activeSubscriptions: subscriptionCount || 0,
          totalRevenue,
          leadsThisMonth: leadsCount || 0,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

// Hook for admin businesses list
export function useAdminBusinessesList(status?: ListingStatus) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      setBusinesses((data || []) as Business[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [status]);

  return { businesses, loading, error, refetch: fetchBusinesses };
}

// Hook for leads
export function useBusinessLeads(businessId?: string) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) {
      setLeads([]);
      setLoading(false);
      return;
    }

    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLeads((data || []) as Lead[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [businessId]);

  return { leads, loading, error };
}

// Hook for payments
export function usePayments(businessId?: string) {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPayments([]);
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      try {
        let query = supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false });

        if (businessId) {
          query = query.eq('business_id', businessId);
        } else {
          query = query.eq('user_id', user.uid);
        }

        const { data, error } = await query;
        if (error) throw error;
        setPayments((data || []) as Payment[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user, businessId]);

  return { payments, loading, error };
}

// Hook to check admin status
export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.uid)
          .in('role', ['admin', 'moderator']);

        if (error) throw error;
        setIsAdmin((data || []).length > 0);
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user]);

  return { isAdmin, loading };
}
