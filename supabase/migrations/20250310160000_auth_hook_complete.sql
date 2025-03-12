-- First, clean up any existing hooks
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the function in the auth schema
CREATE OR REPLACE FUNCTION auth.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _role TEXT;
    _name TEXT;
BEGIN
    -- Get user details from the NEW record
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

    -- If user is a client, create client entry
    IF _role = 'Client' THEN
        INSERT INTO public.clients (
            user_id,
            brand_name
        ) VALUES (
            NEW.id,
            'Flipkart'  -- Default brand as requested
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW; -- Still return NEW to allow the user creation to proceed
END;
$$;

-- Create the trigger in the auth schema
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION auth.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, service_role, authenticated;
GRANT SELECT ON auth.users TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;

-- Enable the trigger explicitly
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- Verify the trigger is enabled
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
        AND t.tgenabled = 'O'
    ) THEN
        RAISE EXCEPTION 'Trigger is not enabled on auth.users';
    END IF;
END;
$$; 