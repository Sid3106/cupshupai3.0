-- Drop existing objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS auth.handle_new_user();

-- Create the function with proper ownership
CREATE OR REPLACE FUNCTION auth.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Log the attempt
    RAISE LOG 'handle_new_user starting for user %', NEW.id;
    
    BEGIN
        -- Create profile entry
        INSERT INTO public.profiles (
            user_id,
            role,
            name,
            email,
            phone,
            city
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'role', 'Client')::user_role,
            COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
            NEW.email,
            NEW.raw_user_meta_data->>'phone',
            NEW.raw_user_meta_data->>'city'
        );
        
        RAISE LOG 'Profile created for user %', NEW.id;

        -- If user is a client, create client entry
        IF NEW.raw_user_meta_data->>'role' IS NULL OR NEW.raw_user_meta_data->>'role' = 'Client' THEN
            INSERT INTO public.clients (
                user_id,
                brand_name
            ) VALUES (
                NEW.id,
                'Flipkart'
            );
            
            RAISE LOG 'Client entry created for user %', NEW.id;
        END IF;

    EXCEPTION WHEN OTHERS THEN
        -- Log the full error details
        RAISE LOG 'Error in handle_new_user for user %: % (%)', NEW.id, SQLERRM, SQLSTATE;
    END;

    RETURN NEW;
END;
$$;

-- Set proper ownership and permissions
ALTER FUNCTION auth.handle_new_user() OWNER TO supabase_auth_admin;
REVOKE ALL ON FUNCTION auth.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION auth.handle_new_user() TO supabase_auth_admin;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auth.handle_new_user();

-- Enable the trigger explicitly
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- Verify everything is set up correctly
DO $$
DECLARE
    trigger_exists boolean;
    function_exists boolean;
    correct_owner boolean;
BEGIN
    -- Check trigger
    SELECT EXISTS (
        SELECT 1
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE t.tgname = 'on_auth_user_created'
        AND n.nspname = 'auth'
        AND c.relname = 'users'
        AND t.tgenabled = 'O'
    ) INTO trigger_exists;

    -- Check function
    SELECT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'handle_new_user'
        AND n.nspname = 'auth'
    ) INTO function_exists;

    -- Check owner
    SELECT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        JOIN pg_roles r ON p.proowner = r.oid
        WHERE p.proname = 'handle_new_user'
        AND n.nspname = 'auth'
        AND r.rolname = 'supabase_auth_admin'
    ) INTO correct_owner;

    IF NOT (trigger_exists AND function_exists AND correct_owner) THEN
        RAISE EXCEPTION 'Verification failed: trigger_exists=%, function_exists=%, correct_owner=%',
            trigger_exists, function_exists, correct_owner;
    END IF;
END;
$$; 