-- Grant necessary permissions to the auth system
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Ensure the postgres role has proper permissions
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO postgres;

-- Ensure the auth role has proper permissions
GRANT ALL ON ALL TABLES IN SCHEMA auth TO authenticator;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO authenticator;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO authenticator;

-- Recreate the handle_new_user trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER 
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    role,
    name
  )
  VALUES (
    new.id,
    'CupShup',
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RETURN new; -- Ensure user creation succeeds even if profile creation fails
END;
$$;