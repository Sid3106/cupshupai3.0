-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Ensure proper schema permissions
GRANT USAGE ON SCHEMA auth TO postgres, service_role, authenticated;
GRANT SELECT ON auth.users TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;

-- Ensure the function has proper security context
ALTER FUNCTION public.handle_new_user() SET search_path = public, auth;

-- Create the trigger with explicit schema references
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    SECURITY DEFINER
    EXECUTE FUNCTION public.handle_new_user();

-- Verify the trigger exists and is enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE t.tgname = 'on_auth_user_created'
        AND n.nspname = 'auth'
        AND c.relname = 'users'
    ) THEN
        RAISE EXCEPTION 'Trigger was not created successfully';
    END IF;
END;
$$; 