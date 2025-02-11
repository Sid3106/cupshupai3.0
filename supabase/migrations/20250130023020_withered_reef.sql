-- Remove columns from profiles table
ALTER TABLE profiles 
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS city,
  DROP COLUMN IF EXISTS brand_name;

-- Add profile_photo column
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS profile_photo TEXT;

-- Make email column NOT NULL
ALTER TABLE profiles 
  ALTER COLUMN email SET NOT NULL;

-- Update handle_new_user function to match new structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    role,
    name,
    email
  )
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      CASE 
        WHEN NEW.raw_user_meta_data->>'is_invited' = 'true' THEN
          CASE 
            WHEN NEW.raw_user_meta_data->>'role' = 'Vendor' THEN 'Vendor'::user_role
            ELSE 'Client'::user_role
          END
        ELSE 'Client'::user_role
      END
    ),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;