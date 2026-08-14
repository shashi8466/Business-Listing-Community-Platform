-- ============================================================
-- Migration: Fix Admin RLS Policies for Business Status Updates
-- Created: 2026-08-14
-- Purpose:
--   Ensure admin users can UPDATE the status of any business
--   record via the Supabase client. The existing is_admin()
--   function uses SECURITY DEFINER, so it can read user_roles
--   without RLS interference. This migration:
--   1. Recreates is_admin() with SECURITY DEFINER to bypass RLS
--   2. Drops and recreates specific admin UPDATE/SELECT policies
--      for businesses to guarantee they are active and correct
--   3. Adds a dedicated index on businesses.status for
--      frequently filtered admin queries
-- ============================================================

-- ============================================================
-- 1. Ensure is_admin() is SECURITY DEFINER (reads user_roles
--    without being blocked by user_roles RLS policies).
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'moderator')
  )
$$;

-- ============================================================
-- 2. Ensure user_roles SELECT is open to authenticated users
--    so is_admin() can query it without issues.
--    (The SECURITY DEFINER already bypasses this, but we add
--    an explicit policy just in case.)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_roles'
      AND policyname = 'Admins can read all user roles'
  ) THEN
    CREATE POLICY "Admins can read all user roles" ON public.user_roles
      FOR SELECT USING (public.is_admin(auth.uid()));
  END IF;
END
$$;

-- ============================================================
-- 3. Drop and recreate admin policies for businesses to ensure
--    they are correct and apply to all operations including
--    UPDATE (status changes, featured toggle).
-- ============================================================

-- Drop existing admin policy if present (safe to recreate)
DROP POLICY IF EXISTS "Admins can manage all businesses" ON public.businesses;

-- Admins can SELECT all businesses (including pending/rejected)
CREATE POLICY "Admins can select all businesses" ON public.businesses
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Admins can UPDATE any business (covers status, is_featured, etc.)
CREATE POLICY "Admins can update all businesses" ON public.businesses
  FOR UPDATE USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Admins can DELETE any business
CREATE POLICY "Admins can delete all businesses" ON public.businesses
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Admins can INSERT any business (e.g. admin-created listings)
CREATE POLICY "Admins can insert all businesses" ON public.businesses
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================
-- 4. Add index on (status) for fast filter queries if missing
--    (already exists in the original migration, but IF NOT EXISTS
--    guards against re-running errors).
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);

-- Composite index for admin queries that filter by status + created_at
CREATE INDEX IF NOT EXISTS idx_businesses_status_created
  ON public.businesses(status, created_at DESC);

-- ============================================================
-- 5. Ensure the businesses table has RLS enabled
-- ============================================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
