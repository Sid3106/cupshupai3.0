-- Update function to include auth schema in search path
ALTER FUNCTION public.handle_auth_user_created() SET search_path = auth, public;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres, authenticated;
GRANT SELECT ON auth.users TO postgres, authenticated;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "trigger_insert_profile" ON public.profiles;
DROP POLICY IF EXISTS "trigger_insert_client" ON public.clients;

-- Create more specific RLS policies
CREATE POLICY "trigger_insert_profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE auth.users.id = user_id
            AND auth.users.raw_user_meta_data->>'role' IS NOT NULL
        )
    );

CREATE POLICY "trigger_insert_client"
    ON public.clients
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1
            FROM auth.users
            WHERE auth.users.id = user_id
            AND (auth.users.raw_user_meta_data->>'role' = 'Client' OR auth.users.raw_user_meta_data->>'role' IS NULL)
        )
    );

-- Verify function has correct search path
DO $$
DECLARE
    v_search_path text;
BEGIN
    SELECT pg_get_functiondef(p.oid)
    INTO v_search_path
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'handle_auth_user_created'
    AND n.nspname = 'public';

    IF v_search_path NOT LIKE '%SET search_path = auth, public%' THEN
        RAISE EXCEPTION 'Incorrect search_path in function';
    END IF;
END;
$$; 