-- Drop existing policies
DROP POLICY IF EXISTS "CupShup users can manage vendors" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can view own data" ON public.vendors;

-- Create new policy for CupShup users and vendors
CREATE POLICY "CupShup see all vendors"
ON public.vendors
FOR SELECT
TO authenticated
USING (
  (current_setting('request.jwt.claims')::jsonb ->> 'role') = 'CupShup'
  OR user_id = auth.uid()
);