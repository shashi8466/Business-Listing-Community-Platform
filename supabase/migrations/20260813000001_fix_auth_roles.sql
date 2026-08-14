-- ========================================================
-- 1. Create a trigger function to auto-insert into user_roles
-- ========================================================

-- This ensures every new signup automatically gets a role record
-- and prevents public users from creating 'admin' accounts.

-- Alter enum to add business if it doesn't exist
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'business';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  requested_role text;
BEGIN
  -- Extract requested role from user_metadata (set by client during signup)
  requested_role := new.raw_user_meta_data->>'role';
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, CASE 
      WHEN requested_role = 'business' THEN 'business'::public.app_role
      ELSE 'user'::public.app_role
    END
  );
  
  RETURN new;
END;
$$;

-- Drop the trigger if it already exists to recreate it safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ========================================================
-- 2. Update RLS on user_roles
-- ========================================================

-- Ensure users can only read their own role.
-- (Admins can read all roles, which is already in the previous migration).
-- We DO NOT allow inserts on user_roles from the client anymore, because the trigger handles it.

-- Enable RLS (just in case)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 3. Enhance RLS on Businesses (ensure it is strictly enforced)
-- ========================================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
