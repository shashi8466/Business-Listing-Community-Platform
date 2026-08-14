import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ContentReport } from '@/types/community';

export const useModeration = (communityId: string | undefined) => {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!communityId) {
      setLoading(false);
      return;
    }

    const fetchReports = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('content_reports')
          .select('*')
          .eq('community_id', communityId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReports((data as ContentReport[]) || []);
      } catch (err: any) {
        console.error('Error fetching reports:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [communityId]);

  const createReport = async (data: {
    content_type: 'discussion' | 'comment' | 'event' | 'member';
    content_id: string;
    reason: string;
    details?: string;
  }) => {
    if (!communityId) return { error: 'No community' };

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return { error: 'Not authenticated' };

    const { data: report, error } = await supabase
      .from('content_reports')
      .insert({
        ...data,
        community_id: communityId,
        reporter_id: user.id,
      })
      .select()
      .single();

    return { report, error: error?.message };
  };

  const resolveReport = async (
    reportId: string,
    status: 'resolved' | 'dismissed',
    note?: string
  ) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('content_reports')
      .update({
        status,
        resolved_at: new Date().toISOString(),
        resolved_by: user.id,
        resolution_note: note,
      })
      .eq('id', reportId);

    if (!error) {
      setReports(prev =>
        prev.map(r =>
          r.id === reportId
            ? { ...r, status, resolved_at: new Date().toISOString(), resolved_by: user.id, resolution_note: note || null }
            : r
        )
      );
    }

    return { error: error?.message };
  };

  const deleteContent = async (contentType: string, contentId: string) => {
    let error;
    
    switch (contentType) {
      case 'discussion':
        ({ error } = await supabase.from('discussions').delete().eq('id', contentId));
        break;
      case 'comment':
        ({ error } = await supabase.from('discussion_comments').delete().eq('id', contentId));
        break;
      case 'event':
        ({ error } = await supabase.from('community_events').delete().eq('id', contentId));
        break;
    }

    return { error: error?.message };
  };

  const banMember = async (userId: string) => {
    if (!communityId) return { error: 'No community' };

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId);

    return { error: error?.message };
  };

  return {
    reports,
    loading,
    error,
    createReport,
    resolveReport,
    deleteContent,
    banMember,
    pendingCount: reports.filter(r => r.status === 'pending').length,
  };
};
