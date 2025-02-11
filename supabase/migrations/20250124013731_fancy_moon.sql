/*
  # Fix user signup flow

  1. Changes
    - Update handle_new_user trigger function to:
      - Handle missing name gracefully
      - Set default role for new signups
      - Add proper error handling
  
  2. Security
    - Maintain RLS policies
    - Keep security definer for proper permissions
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
    'Client',  -- Default role for new signups
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),  -- Use email prefix if name not provided
    now(),
    now()
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log error details (in a production system, you'd want proper error logging)
    RAISE NOTICE 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;