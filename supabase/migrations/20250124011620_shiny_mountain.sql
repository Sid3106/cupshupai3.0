/*
  # Create Test CupShup User

  1. Updates
    - Fix handle_new_user function to remove email field
    - Create test user with CupShup role
    
  2. Security
    - Uses secure password hashing
    - Sets up proper role and permissions
*/

-- First fix the handle_new_user trigger function to remove email field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, name)
  VALUES (new.id, 'Vendor', new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle test user creation
CREATE OR REPLACE FUNCTION create_test_user()
RETURNS void AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Create user using auth.users table
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    last_sign_in_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'sidharth@cupshup.co.in',
    crypt('cupshup@1234', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Sidharth", "is_test_account": true}',
    false,
    now(),
    now(),
    now()
  )
  RETURNING id INTO v_user_id;

  -- Delete any existing profile for this user to avoid conflicts
  DELETE FROM public.profiles WHERE user_id = v_user_id;

  -- Create profile for the user with CupShup role
  INSERT INTO public.profiles (
    user_id,
    role,
    name,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    'CupShup',
    'Sidharth',
    now(),
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function
SELECT create_test_user();

-- Clean up
DROP FUNCTION create_test_user();