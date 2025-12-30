import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Discussion, DiscussionComment } from '@/types/community';

export const useDiscussions = (communityId: string | undefined) => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!communityId) {
      setLoading(false);
      return;
    }

    const fetchDiscussions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('discussions')
          .select('*')
          .eq('community_id', communityId)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDiscussions((data as Discussion[]) || []);
      } catch (err: any) {
        console.error('Error fetching discussions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, [communityId]);

  const createDiscussion = async (title: string, content: string) => {
    if (!communityId) return { error: 'No community' };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('discussions')
      .insert({
        community_id: communityId,
        user_id: user.id,
        title,
        content,
      })
      .select()
      .single();

    if (!error && data) {
      setDiscussions(prev => [data as Discussion, ...prev]);
    }

    return { data, error: error?.message };
  };

  return { discussions, loading, error, createDiscussion };
};

export const useDiscussion = (discussionId: string | undefined) => {
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<DiscussionComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!discussionId) {
      setLoading(false);
      return;
    }

    const fetchDiscussion = async () => {
      try {
        setLoading(true);

        // Fetch discussion
        const { data: discussionData, error: discussionError } = await supabase
          .from('discussions')
          .select('*')
          .eq('id', discussionId)
          .maybeSingle();

        if (discussionError) throw discussionError;
        setDiscussion(discussionData as Discussion);

        // Increment view count
        if (discussionData) {
          await supabase
            .from('discussions')
            .update({ view_count: (discussionData.view_count || 0) + 1 })
            .eq('id', discussionId);
        }

        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('discussion_comments')
          .select('*')
          .eq('discussion_id', discussionId)
          .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;
        setComments((commentsData as DiscussionComment[]) || []);
      } catch (err: any) {
        console.error('Error fetching discussion:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussion();
  }, [discussionId]);

  const addComment = async (content: string, parentId?: string) => {
    if (!discussionId) return { error: 'No discussion' };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('discussion_comments')
      .insert({
        discussion_id: discussionId,
        user_id: user.id,
        content,
        parent_id: parentId || null,
      })
      .select()
      .single();

    if (!error && data) {
      setComments(prev => [...prev, data as DiscussionComment]);
    }

    return { data, error: error?.message };
  };

  const likeComment = async (commentId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('comment_likes')
      .insert({ comment_id: commentId, user_id: user.id });

    if (!error) {
      setComments(prev =>
        prev.map(c =>
          c.id === commentId ? { ...c, like_count: c.like_count + 1 } : c
        )
      );
    }

    return { error: error?.message };
  };

  return { discussion, comments, loading, error, addComment, likeComment };
};
