/*
  # Fix Vendors Table Structure

  1. Changes
    - Drop existing constraints and indexes
    - Update vendors table structure
    - Add proper indexes
    - Update policies

  2. Security
    - Maintain RLS
    - Update policies for proper access control
*/

-- First drop existing constraints and indexes safely
DO $$ 
BEGIN
    -- Drop foreign key if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'vendors_user_id_fkey'
        AND table_name = 'vendors'
    ) THEN
        ALTER TABLE vendors DROP CONSTRAINT vendors_user_id_fkey;
    END IF;

    -- Drop indexes if they exist
    DROP INDEX IF EXISTS vendors_user_id_idx;
    DROP INDEX IF EXISTS vendors_vendor_name_idx;
END $$;

-- Update vendors table structure
ALTER TABLE vendors
  ALTER COLUMN vendor_name SET NOT NULL,
  ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE vendors
  ADD CONSTRAINT vendors_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(user_id) 
  ON DELETE CASCADE;

-- Create new indexes
CREATE INDEX vendors_user_id_idx ON vendors(user_id);
CREATE INDEX vendors_vendor_name_idx ON vendors(vendor_name);

-- Recreate policies
DROP POLICY IF EXISTS "CupShup users can view all vendors" ON vendors;
DROP POLICY IF EXISTS "Vendors can view own record" ON vendors;

CREATE POLICY "CupShup users can view all vendors"
  ON vendors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'CupShup'
    )
  );

CREATE POLICY "Vendors can view own record"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Update vendor creation trigger
CREATE OR REPLACE FUNCTION create_vendor_on_profile()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'Vendor' THEN
        INSERT INTO vendors (user_id, vendor_name)
        VALUES (NEW.user_id, NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS create_vendor_after_profile ON profiles;
CREATE TRIGGER create_vendor_after_profile
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_vendor_on_profile();