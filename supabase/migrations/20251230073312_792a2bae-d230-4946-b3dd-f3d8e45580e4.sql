-- Create storage bucket for business images
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view images (public bucket)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-images');

-- Allow authenticated users to upload images
CREATE POLICY "Allow uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'business-images');

-- Allow users to update their own images
CREATE POLICY "Allow updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'business-images');

-- Allow users to delete images
CREATE POLICY "Allow deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'business-images');