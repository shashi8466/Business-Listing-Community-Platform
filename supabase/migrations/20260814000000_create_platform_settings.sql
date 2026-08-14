-- Create the platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  general jsonb DEFAULT '{}'::jsonb,
  branding jsonb DEFAULT '{}'::jsonb,
  seo jsonb DEFAULT '{}'::jsonb,
  email jsonb DEFAULT '{}'::jsonb,
  payments jsonb DEFAULT '{}'::jsonb,
  security jsonb DEFAULT '{}'::jsonb,
  notifications jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert a default row if the table is empty
INSERT INTO public.platform_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.platform_settings);

-- Set up Row Level Security
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read platform settings (for logo, title, etc.)
CREATE POLICY "Public read access to platform_settings"
  ON public.platform_settings FOR SELECT
  USING (true);

-- Only admins can update platform settings
CREATE POLICY "Admin update access to platform_settings"
  ON public.platform_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert platform settings (though there should only be one row)
CREATE POLICY "Admin insert access to platform_settings"
  ON public.platform_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
