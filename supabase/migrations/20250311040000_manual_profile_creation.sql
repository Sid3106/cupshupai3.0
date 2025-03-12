-- Since the trigger approach isn't working, let's modify our Edge Function
-- to manually create profiles and clients after user creation.

-- First, let's create a function that the Edge Function can call
CREATE OR REPLACE FUNCTION public.create_profile_and_client(
    p_user_id UUID,
    p_email TEXT,
    p_name TEXT,
    p_phone TEXT,
    p_city TEXT,
    p_role TEXT DEFAULT 'Client'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Create profile entry
    INSERT INTO public.profiles (
        user_id,
        role,
        name,
        email,
        phone,
        city
    ) VALUES (
        p_user_id,
        p_role::user_role,
        p_name,
        p_email,
        CASE 
            WHEN p_phone IS NOT NULL AND p_phone != '' 
            THEN p_phone::bigint 
            ELSE NULL 
        END,
        p_city
    );
    
    -- If user is a client, create client entry
    IF p_role = 'Client' THEN
        INSERT INTO public.clients (
            user_id,
            brand_name,
            client_name
        ) VALUES (
            p_user_id,
            'Flipkart',
            p_name
        );
    END IF;

    v_result := jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'profile_created', true,
        'client_created', (p_role = 'Client')
    );
    
    RETURN v_result;
EXCEPTION WHEN OTHERS THEN
    v_result := jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'error_code', SQLSTATE
    );
    
    RETURN v_result;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_profile_and_client TO anon, authenticated, service_role; 