/*
  # Fix metadata field names in handle_new_user function

  1. Changes
    - Update handle_new_user function to use user_metadata instead of raw_user_meta_data
    - Update handle_new_user function to use app_metadata instead of raw_app_meta_data

  2. Security
    - Maintain existing security settings
*/

-- Update handle_new_user function to use correct metadata fields
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
      (NEW.user_metadata->>'role')::user_role,
      CASE 
        WHEN NEW.user_metadata->>'is_invited' = 'true' THEN
          CASE 
            WHEN NEW.user_metadata->>'role' = 'Vendor' THEN 'Vendor'::user_role
            ELSE 'Client'::user_role
          END
        ELSE 'Client'::user_role
      END
    ),
    COALESCE(NEW.user_metadata->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$; 