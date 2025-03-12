-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create updated handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _role TEXT;
    _metadata JSONB;
    _name TEXT;
    _phone TEXT;
    _city TEXT;
BEGIN
    -- Get the metadata from either raw_user_meta_data or user_metadata
    _metadata := COALESCE(NEW.raw_user_meta_data, NEW.user_metadata);
    
    -- Log the metadata for debugging
    RAISE LOG 'Processing user % with metadata: %', NEW.id, _metadata;
    
    -- Get the role from metadata
    _role := COALESCE(_metadata->>'role', 'Client');
    
    -- Get user details
    _name := COALESCE(_metadata->>'name', split_part(NEW.email, '@', 1));
    _phone := _metadata->>'phone';
    _city := _metadata->>'city';
    
    -- Create profile entry for all users
    INSERT INTO public.profiles (
        id,
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
        _phone,
        _city
    );

    -- If the user is a client, create entry in clients table
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
    -- Log any errors
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, authenticated, service_role; 