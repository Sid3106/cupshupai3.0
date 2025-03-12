-- First, let's clean up our previous attempts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the hook function
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_data json;
    _role TEXT;
    _name TEXT;
    _phone TEXT;
    _city TEXT;
BEGIN
    -- Get user data from the request
    user_data := current_setting('request.jwt.claim', true)::json;
    
    -- Get metadata
    WITH user_info AS (
        SELECT 
            raw_user_meta_data,
            email
        FROM auth.users
        WHERE id = (user_data->>'sub')::uuid
    )
    INSERT INTO public.profiles (
        user_id,
        role,
        name,
        email,
        phone,
        city
    )
    SELECT
        (user_data->>'sub')::uuid,
        COALESCE((u.raw_user_meta_data->>'role')::user_role, 'Client'::user_role),
        COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
        u.email,
        u.raw_user_meta_data->>'phone',
        u.raw_user_meta_data->>'city'
    FROM user_info u;

    -- If the user is a client, create client entry
    IF EXISTS (
        SELECT 1 
        FROM auth.users 
        WHERE id = (user_data->>'sub')::uuid 
        AND (raw_user_meta_data->>'role' IS NULL OR raw_user_meta_data->>'role' = 'Client')
    ) THEN
        INSERT INTO public.clients (
            user_id,
            brand_name
        ) VALUES (
            (user_data->>'sub')::uuid,
            'Flipkart'  -- Default brand as requested
        );
    END IF;

    -- Return success
    RETURN json_build_object(
        'success', true,
        'user_id', user_data->>'sub'
    );
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    RAISE LOG 'Error in handle_auth_user_created: %', SQLERRM;
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

-- Set up the hook
CREATE OR REPLACE FUNCTION auth.on_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call our handler function
  PERFORM public.handle_auth_user_created();
  RETURN NEW;
END;
$$; 