-- First, clean up any existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS auth.handle_new_user();

-- Create the function that will be called by Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _role TEXT;
    _name TEXT;
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

    -- If user is a client, create client entry
    IF _role = 'Client' THEN
        INSERT INTO public.clients (
            user_id,
            brand_name
        ) VALUES (
            NEW.id,
            'Flipkart'
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't prevent user creation
    RAISE LOG 'Error in handle_new_user_signup: % (%)', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Create the trigger in public schema
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_signup();

-- Enable RLS but allow the trigger function to work
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policies that allow the trigger function to insert
CREATE POLICY "trigger_insert_profile"
    ON public.profiles
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "trigger_insert_client"
    ON public.clients
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Verify the function exists and trigger is created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'handle_new_user_signup'
        AND n.nspname = 'public'
    ) THEN
        RAISE EXCEPTION 'Function handle_new_user_signup does not exist in public schema';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE t.tgname = 'on_auth_user_created'
        AND n.nspname = 'auth'
        AND c.relname = 'users'
    ) THEN
        RAISE EXCEPTION 'Trigger on_auth_user_created does not exist on auth.users';
    END IF;
END;
$$; 