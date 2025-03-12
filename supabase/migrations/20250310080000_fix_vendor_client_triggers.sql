-- First, drop all existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_create_client ON auth.users;

-- Update the handle_new_user function to handle all user types
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    _role TEXT;
    _metadata JSONB;
    _name TEXT;
BEGIN
    -- Get the metadata from either raw_user_meta_data or user_metadata
    _metadata := COALESCE(NEW.raw_user_meta_data, NEW.user_metadata);
    
    -- Log the metadata for debugging
    RAISE NOTICE 'Processing user % with metadata: %', NEW.id, _metadata;
    
    -- Get the role from metadata
    _role := COALESCE(_metadata->>'role', 'CupShup');
    
    -- Get the name with fallback
    _name := COALESCE(_metadata->>'name', split_part(NEW.email, '@', 1));
    
    -- Create profile entry for all users
    INSERT INTO public.profiles (
        user_id,
        role,
        name,
        phone,
        city,
        email
    ) VALUES (
        NEW.id,
        _role,
        _name,
        _metadata->>'phone',
        _metadata->>'city',
        NEW.email
    );

    -- Handle specific role entries
    CASE _role
        WHEN 'Client' THEN
            -- Create client entry
            INSERT INTO public.clients (
                user_id,
                brand_name
            ) VALUES (
                NEW.id,
                _metadata->>'brand_name'
            );
        WHEN 'Vendor' THEN
            -- Create vendor entry with all available fields
            INSERT INTO public.vendors (
                user_id,
                vendor_name,
                phone,
                city
            ) VALUES (
                NEW.id,
                _name,  -- Use the same name for vendor_name
                _metadata->>'phone',
                _metadata->>'city'
            );
        ELSE
            -- No additional action needed for other roles
            NULL;
    END CASE;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- Create single trigger for all user types
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user(); 