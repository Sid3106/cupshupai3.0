/*
  # Add email column and update role handling

  1. Changes
    - Add email column to profiles table
    - Create trigger to sync email from auth.users
    - Update handle_new_user function to set correct role

  2. Security
    - Email column inherits existing RLS policies
    - Email is kept in sync with auth.users
*/

-- Add email column to profiles table
ALTER TABLE profiles
ADD COLUMN email TEXT;

-- Update existing profiles with email from auth.users
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id;

-- Make email column NOT NULL after populating data
ALTER TABLE profiles
ALTER COLUMN email SET NOT NULL;

-- Create function to sync email on user update
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET email = NEW.email
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync email when user is updated
CREATE TRIGGER sync_auth_user_email
AFTER UPDATE OF email ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_user_email();

-- Update handle_new_user function to set correct role based on metadata
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