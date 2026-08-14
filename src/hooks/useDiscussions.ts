import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Discussion, DiscussionComment } from '@/types/community';

// Helper: upload a file to Supabase storage and return the public URL
export const uploadDiscussionMedia = async (file: File, folder: string = 'discussions'): Promise<{ url: string | null; error: string | null }> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('business-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error('Upload error:', error);
    return { url: null, error: error.message };
  }

  const { data: urlData } = supabase.storage.from('business-images').getPublicUrl(data.path);
  return { url: urlData.publicUrl, error: null };
};

// Helper: determine attachment type from MIME type
export const getAttachmentType = (file: File): 'image' | 'video' | 'file' => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'file';
};

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

        // Resolve author display names from user_profiles
        const withAuthors: Discussion[] = await Promise.all(
          (data || []).map(async (d: any) => {
            if (d.author_name) return d as Discussion;
            try {
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('display_name')
                .eq('id', d.user_id)
                .maybeSingle();
              return { ...d, author_name: profile?.display_name || 'Community Member' } as Discussion;
            } catch {
              return { ...d, author_name: 'Community Member' } as Discussion;
            }
          })
        );

        setDiscussions(withAuthors);
      } catch (err: any) {
        console.error('Error fetching discussions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, [communityId]);

  const createDiscussion = async (
    title: string,
    content: string,
    attachment?: { url: string; type: 'image' | 'video' | 'file'; name: string } | null
  ) => {
    if (!communityId) return { error: 'No community' };

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return { error: 'Not authenticated' };

    // Get author display name
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle();

    const authorName = profile?.display_name || 'Community Member';

    const { data, error } = await supabase
      .from('discussions')
      .insert({
        community_id: communityId,
        user_id: user.id,
        title,
        content,
        author_name: authorName,
        attachment_url: attachment?.url || null,
        attachment_type: attachment?.type || null,
        attachment_name: attachment?.name || null,
      })
      .select()
      .single();

    if (!error && data) {
      setDiscussions(prev => [{ ...data, author_name: authorName } as Discussion, ...prev]);
    }

    return { data, error: error?.message };
  };

  const deleteDiscussion = async (discussionId: string) => {
    const { error } = await supabase
      .from('discussions')
      .delete()
      .eq('id', discussionId);

    if (!error) {
      setDiscussions(prev => prev.filter(d => d.id !== discussionId));
    }

    return { error: error?.message };
  };

  return { discussions, loading, error, createDiscussion, deleteDiscussion };
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

        // Resolve author name
        let resolvedDiscussion = discussionData as Discussion;
        if (discussionData && !discussionData.author_name) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('display_name')
            .eq('id', discussionData.user_id)
            .maybeSingle();
          resolvedDiscussion = { ...discussionData, author_name: profile?.display_name || 'Community Member' } as Discussion;
        }

        setDiscussion(resolvedDiscussion);

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

        // Resolve author names for comments
        const commentsWithAuthors = await Promise.all(
          (commentsData || []).map(async (c: any) => {
            if (c.author_name) return c as DiscussionComment;
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('display_name')
              .eq('id', c.user_id)
              .maybeSingle();
            return { ...c, author_name: profile?.display_name || 'Community Member' } as DiscussionComment;
          })
        );

        setComments(commentsWithAuthors);
      } catch (err: any) {
        console.error('Error fetching discussion:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussion();
  }, [discussionId]);

  const addComment = async (
    content: string,
    attachment?: { url: string; type: 'image' | 'video' | 'file'; name: string } | null,
    parentId?: string
  ) => {
    if (!discussionId) return { error: 'No discussion' };

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return { error: 'Not authenticated' };

    // Get author display name
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle();

    const authorName = profile?.display_name || 'Community Member';

    const { data, error } = await supabase
      .from('discussion_comments')
      .insert({
        discussion_id: discussionId,
        user_id: user.id,
        content,
        parent_id: parentId || null,
        author_name: authorName,
        attachment_url: attachment?.url || null,
        attachment_type: attachment?.type || null,
        attachment_name: attachment?.name || null,
      })
      .select()
      .single();

    if (!error && data) {
      const newComment = { ...data, author_name: authorName } as DiscussionComment;
      setComments(prev => [...prev, newComment]);

      // Increment reply_count on discussion
      if (discussion) {
        await supabase
          .from('discussions')
          .update({ reply_count: (discussion.reply_count || 0) + 1 })
          .eq('id', discussionId);
        setDiscussion(prev => prev ? { ...prev, reply_count: (prev.reply_count || 0) + 1 } : null);
      }
    }

    return { data, error: error?.message };
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('discussion_comments')
      .delete()
      .eq('id', commentId);

    if (!error) {
      setComments(prev => prev.filter(c => c.id !== commentId));
      // Decrement reply_count
      if (discussion) {
        await supabase
          .from('discussions')
          .update({ reply_count: Math.max((discussion.reply_count || 0) - 1, 0) })
          .eq('id', discussionId);
        setDiscussion(prev => prev ? { ...prev, reply_count: Math.max((prev.reply_count || 0) - 1, 0) } : null);
      }
    }

    return { error: error?.message };
  };

  const likeComment = async (commentId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
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

  return { discussion, comments, loading, error, addComment, deleteComment, likeComment };
};
