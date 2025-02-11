-- Drop existing trigger to prevent conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Ensure proper schema configuration
ALTER ROLE authenticated SET search_path TO public;
ALTER ROLE anon SET search_path TO public;
ALTER ROLE service_role SET search_path TO public;

-- Reset and regrant essential permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Ensure RLS is properly configured
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Recreate the trigger function with minimal complexity
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, name)
  VALUES (
    NEW.id,
    'CupShup',
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure the trigger function has proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;