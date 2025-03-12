-- Description: Add service role policy to clients table for invitation process
-- This migration adds a policy allowing the service role to perform all operations on the clients table

-- Enable RLS on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Service role can manage clients" ON public.clients;

-- Create new policy for service role
CREATE POLICY "Service role can manage clients"
ON public.clients
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify existing policies remain intact
DO $$
BEGIN
    -- Verify the policy was created
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'clients'
        AND policyname = 'Service role can manage clients'
    ) THEN
        RAISE EXCEPTION 'Service role policy was not created successfully';
    END IF;
END
$$;

-- Add policy to allow service role to insert into clients table
CREATE POLICY "Allow service role to insert clients" ON public.clients
FOR INSERT TO service_role
WITH CHECK (true);

-- Add policy to allow service role to update clients
CREATE POLICY "Allow service role to update clients" ON public.clients
FOR UPDATE TO service_role
USING (true)
WITH CHECK (true);

-- Add policy to allow service role to delete clients
CREATE POLICY "Allow service role to delete clients" ON public.clients
FOR DELETE TO service_role
USING (true);
