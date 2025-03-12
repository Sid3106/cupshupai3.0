-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS test_auth_trigger ON auth.users;
DROP TRIGGER IF EXISTS test_public_trigger ON auth.users;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_auth_user_created();
DROP FUNCTION IF EXISTS auth.test_auth_trigger();
DROP FUNCTION IF EXISTS public.test_public_trigger();
DROP FUNCTION IF EXISTS auth.on_auth_user_created();

-- Create the function following Supabase's recommended pattern
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''  -- Empty search path for security
AS $$
BEGIN
    -- Log the start of function execution
    RAISE LOG 'handle_new_user starting for user % with metadata %', NEW.id, NEW.raw_user_meta_data;
    
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
        CASE 
            WHEN NEW.raw_user_meta_data->>'phone' IS NOT NULL AND NEW.raw_user_meta_data->>'phone' != '' 
            THEN (NEW.raw_user_meta_data->>'phone')::bigint 
            ELSE NULL 
        END,
        NEW.raw_user_meta_data->>'city'
    );
    
    RAISE LOG 'Profile created successfully for user %', NEW.id;

    -- If user is a client, create client entry
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'Client') = 'Client' THEN
        INSERT INTO public.clients (
            user_id,
            brand_name,
            client_name
        ) VALUES (
            NEW.id,
            'Flipkart',
            COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
        );
        
        RAISE LOG 'Client entry created successfully for user %', NEW.id;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    RAISE LOG 'Error in handle_new_user for user %: % (SQLSTATE: %)', 
        NEW.id, SQLERRM, SQLSTATE;
    RAISE LOG 'Failed data: role=%, name=%, email=%, phone=%, city=%',
        COALESCE(NEW.raw_user_meta_data->>'role', 'Client'),
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'city';
    
    -- Return NEW to allow the user creation to proceed
    RETURN NEW;
END;
$$;

-- Create the trigger with the exact name Supabase expects
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Grant necessary permissions to supabase_auth_admin
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Revoke permissions from authenticated and anon roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated, anon; 