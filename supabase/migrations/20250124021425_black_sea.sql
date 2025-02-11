/*
  # Update authentication flow

  1. Changes
    - Simplify handle_new_user trigger function
    - Set default role to 'CupShup' for new signups
    - Remove error handling for cleaner flow
    - Use email prefix as fallback name

  2. Security
    - Maintains existing RLS policies
    - No changes to existing table structures
*/

-- Update the handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    role,
    name,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    'CupShup',  -- Set default role to CupShup
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),  -- Use email prefix if name not provided
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;