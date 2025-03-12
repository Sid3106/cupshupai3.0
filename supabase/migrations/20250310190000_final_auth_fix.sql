-- Drop existing objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS auth.handle_new_user();

-- Create the function in auth schema
CREATE OR REPLACE FUNCTION auth.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
    _role TEXT;
    _name TEXT;
BEGIN
    -- Log the attempt with metadata
    RAISE LOG 'handle_new_user starting for user % with metadata %', NEW.id, NEW.raw_user_meta_data;
    
    BEGIN
        -- Get user details
        _role := COALESCE(NEW.raw_user_meta_data->>'role', 'Client');
        _name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
        
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
            _role::user_role,
            _name,
            NEW.email,
            NEW.raw_user_meta_data->>'phone',
            NEW.raw_user_meta_data->>'city'
        );
        
        RAISE LOG 'Profile created for user % with role %', NEW.id, _role;

        -- If user is a client, create client entry
        IF _role = 'Client' THEN
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
        RAISE LOG 'Error in handle_new_user for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
        -- Don't return NULL, as this prevents the user from being created
        RAISE WARNING 'Failed to create profile/client: %', SQLERRM;
    END;

    -- Always return NEW to ensure the user creation succeeds
    RETURN NEW;
END;
$$;

-- Set proper ownership
ALTER FUNCTION auth.handle_new_user() OWNER TO supabase_auth_admin;

-- Revoke all existing permissions
REVOKE ALL ON FUNCTION auth.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION auth.handle_new_user() FROM authenticated;
REVOKE ALL ON FUNCTION auth.handle_new_user() FROM service_role;

-- Grant execute to auth admin
GRANT EXECUTE ON FUNCTION auth.handle_new_user() TO supabase_auth_admin;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auth.handle_new_user();

-- Enable the trigger explicitly
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- Verify setup
DO $$
DECLARE
    v_owner text;
    v_schema text;
    v_enabled boolean;
BEGIN
    -- Check function location and ownership
    SELECT n.nspname, r.rolname
    INTO v_schema, v_owner
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    JOIN pg_roles r ON p.proowner = r.oid
    WHERE p.proname = 'handle_new_user'
    AND n.nspname = 'auth';

    -- Check if trigger is enabled
    SELECT EXISTS (
        SELECT 1
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE t.tgname = 'on_auth_user_created'
        AND n.nspname = 'auth'
        AND c.relname = 'users'
        AND t.tgenabled = 'O'
    ) INTO v_enabled;

    IF v_schema != 'auth' OR v_owner != 'supabase_auth_admin' OR NOT v_enabled THEN
        RAISE EXCEPTION 'Invalid setup - schema: %, owner: %, enabled: %', 
            v_schema, v_owner, v_enabled;
    END IF;
END;
$$; 