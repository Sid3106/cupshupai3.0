-- Update the handle_new_user function to properly handle client signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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
    RAISE NOTICE 'Processing user % with metadata: %', NEW.id, _metadata;
    
    -- Get the role from metadata
    _role := COALESCE(_metadata->>'role', 'Client');
    
    -- Get user details
    _name := COALESCE(_metadata->>'name', split_part(NEW.email, '@', 1));
    _phone := _metadata->>'phone';
    _city := _metadata->>'city';
    
    -- Create profile entry for all users
    INSERT INTO public.profiles (
        user_id,
        role,
        name,
        email
    ) VALUES (
        NEW.id,
        _role::user_role,
        _name,
        NEW.email
    );

    -- If the user is a client, create entry in clients table
    IF _role = 'Client' THEN
        INSERT INTO public.clients (
            user_id,
            name,
            phone,
            city,
            brand_name,
            status
        ) VALUES (
            NEW.id,
            _name,
            _phone,
            _city,
            'Flipkart',  -- Default brand as requested
            'Active'
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user(); 