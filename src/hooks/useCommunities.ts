import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Community } from '@/types/community';
import { useAuth } from '@/contexts/AuthContext';

interface UseCommunityOptions {
  type?: 'city' | 'interest';
  city?: string;
  interest?: string;
  featured?: boolean;
  limit?: number;
  sort?: 'popular' | 'recent';
}

export const useCommunities = (options: UseCommunityOptions = {}) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('communities')
          .select('*')
          .eq('is_active', true);
          
        if (options.sort === 'recent') {
          query = query.order('created_at', { ascending: false });
        } else {
          query = query.order('member_count', { ascending: false });
        }

        if (options.type) {
          query = query.eq('type', options.type);
        }
        if (options.city) {
          query = query.eq('city', options.city);
        }
        if (options.interest) {
          query = query.eq('interest', options.interest);
        }
        if (options.featured) {
          query = query.eq('is_featured', true);
        }
        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) {
          if (error.code === '42P01') {
            setCommunities([]);
            setLoading(false);
            return;
          }
          throw error;
        }
        
        setCommunities((data as Community[]) || []);
      } catch (err: any) {
        console.error('Error fetching communities:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [options.type, options.city, options.interest, options.featured, options.limit]);

  return { communities, loading, error };
};

export const useCommunity = (slug: string | undefined) => {
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [membership, setMembership] = useState<{ role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchCommunity = async () => {
      try {
        setLoading(true);
        
        // Fetch community
        const { data: communityData, error: communityError } = await supabase
          .from('communities')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (communityError) {
          if (communityError.code === '42P01') {
            setCommunity(null);
            setLoading(false);
            return;
          }
          throw communityError;
        }
        setCommunity(communityData as Community);

        if (user && communityData) {
          const { data: memberData, error: memberError } = await supabase
            .from('community_members')
            .select('role')
            .eq('community_id', communityData.id)
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (memberError && memberError.code !== '42P01') {
            console.warn('Error fetching membership:', memberError.message);
          } else {
            setMembership(memberData);
          }
        } else {
          setMembership(null);
        }
      } catch (err: any) {
        console.error('Error fetching community:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [slug, user]);

  const joinCommunity = async () => {
    if (!community) return { error: 'No community' };
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('community_members')
      .insert({ community_id: community.id, user_id: user.id, role: 'member' });

    if (!error) {
      setMembership({ role: 'member' });
    }
    return { error: error?.message };
  };

  const leaveCommunity = async () => {
    if (!community) return { error: 'No community' };
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', community.id)
      .eq('user_id', user.id);

    if (!error) {
      setMembership(null);
    }
    return { error: error?.message };
  };

  return { community, membership, loading, error, joinCommunity, leaveCommunity };
};

export const useCreateCommunity = () => {
  const [loading, setLoading] = useState(false);

  const createCommunity = async (data: {
    name: string;
    description: string;
    type: 'city' | 'interest';
    city?: string;
    interest?: string;
    rules?: string;
    image_url?: string;
  }) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('Not authenticated');

      const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const { data: community, error } = await supabase
        .from('communities')
        .insert({
          ...data,
          slug,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join as admin
      await supabase
        .from('community_members')
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: 'admin',
        });

      return { community, error: null };
    } catch (err: any) {
      return { community: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { createCommunity, loading };
};
