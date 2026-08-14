-- Migration: enhance discussions with attachments and author display names
-- Add attachment support to discussions and discussion_comments
-- Add author display name caching for performance

-- Add attachment fields to discussions
ALTER TABLE public.discussions
  ADD COLUMN IF NOT EXISTS attachment_url TEXT,
  ADD COLUMN IF NOT EXISTS attachment_type TEXT, -- 'image', 'video', 'file'
  ADD COLUMN IF NOT EXISTS attachment_name TEXT,
  ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Add attachment fields to discussion_comments
ALTER TABLE public.discussion_comments
  ADD COLUMN IF NOT EXISTS attachment_url TEXT,
  ADD COLUMN IF NOT EXISTS attachment_type TEXT, -- 'image', 'video', 'file'
  ADD COLUMN IF NOT EXISTS attachment_name TEXT,
  ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Create a storage bucket for community media if it does not exist
-- (Run manually in Supabase dashboard if policy creation fails)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-media',
  'community-media',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg','image/png','image/gif','image/webp','video/mp4','video/webm','video/ogg','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for community-media bucket
CREATE POLICY IF NOT EXISTS "Anyone can view community media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-media');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload community media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'community-media' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can delete own community media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS for discussions table (ensure it exists)
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can read discussions"
  ON public.discussions FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can create discussions"
  ON public.discussions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Authors can update their own discussions"
  ON public.discussions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Authors can delete their own discussions"
  ON public.discussions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS for discussion_comments table
ALTER TABLE public.discussion_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Anyone can read discussion comments"
  ON public.discussion_comments FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can create comments"
  ON public.discussion_comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Authors can update their own comments"
  ON public.discussion_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Authors can delete their own comments"
  ON public.discussion_comments FOR DELETE
  USING (auth.uid() = user_id);
