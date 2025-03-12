-- Drop existing function from public schema
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function in auth schema with correct ownership
CREATE OR REPLACE FUNCTION auth.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
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
        RAISE EXCEPTION 'Failed to create profile/client: %', SQLERRM;
    END;

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

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auth.handle_new_user();

-- Enable trigger explicitly
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- Verify setup
DO $$
DECLARE
    v_owner text;
    v_schema text;
BEGIN
    SELECT n.nspname, r.rolname
    INTO v_schema, v_owner
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    JOIN pg_roles r ON p.proowner = r.oid
    WHERE p.proname = 'handle_new_user'
    AND n.nspname = 'auth';

    IF v_schema != 'auth' OR v_owner != 'supabase_auth_admin' THEN
        RAISE EXCEPTION 'Invalid setup - schema: %, owner: %', v_schema, v_owner;
    END IF;
END;
$$; 