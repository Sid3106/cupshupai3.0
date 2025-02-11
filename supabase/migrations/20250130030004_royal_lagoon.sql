-- Drop existing policies
DROP POLICY IF EXISTS "CupShup see all vendors" ON public.vendors;

-- Create comprehensive policies for vendors table
CREATE POLICY "CupShup users can view all vendors"
  ON public.vendors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'CupShup'
    )
  );

CREATE POLICY "Vendors can view own record"
  ON public.vendors
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Add index for better join performance
CREATE INDEX IF NOT EXISTS vendors_user_id_idx ON vendors(user_id);