-- Drop existing trigger for testing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a simple diagnostic function in the auth schema
CREATE OR REPLACE FUNCTION auth.test_auth_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Just log that the function was called
    RAISE LOG 'auth.test_auth_trigger was called for user %', NEW.id;
    
    -- Try to insert a simple record into a public table
    INSERT INTO public.profiles (
        user_id,
        role,
        name,
        email
    ) VALUES (
        NEW.id,
        'Client',
        'Test User',
        NEW.email
    );
    
    RAISE LOG 'Successfully inserted into profiles for user %', NEW.id;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    RAISE LOG 'Error in auth.test_auth_trigger: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Create a trigger using the auth schema function
CREATE TRIGGER test_auth_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auth.test_auth_trigger();

-- Also create a function in public schema for comparison
CREATE OR REPLACE FUNCTION public.test_public_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
    -- Just log that the function was called
    RAISE LOG 'public.test_public_trigger was called for user %', NEW.id;
    
    -- Try to insert a simple record into a public table
    INSERT INTO public.profiles (
        user_id,
        role,
        name,
        email
    ) VALUES (
        NEW.id,
        'Client',
        'Test User (Public)',
        NEW.email
    );
    
    RAISE LOG 'Successfully inserted into profiles from public function for user %', NEW.id;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    RAISE LOG 'Error in public.test_public_trigger: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Create a trigger using the public schema function
CREATE TRIGGER test_public_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.test_public_trigger();

-- Check Supabase's auth hook pattern
-- This follows Supabase's documented pattern for auth hooks
CREATE OR REPLACE FUNCTION auth.on_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RAISE LOG 'auth.on_auth_user_created (Supabase pattern) was called for user %', NEW.id;
    
    -- Try to insert a simple record into a public table
    INSERT INTO public.profiles (
        user_id,
        role,
        name,
        email
    ) VALUES (
        NEW.id,
        'Client',
        'Test User (Supabase Pattern)',
        NEW.email
    );
    
    RAISE LOG 'Successfully inserted into profiles from Supabase pattern for user %', NEW.id;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    RAISE LOG 'Error in auth.on_auth_user_created: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$; 