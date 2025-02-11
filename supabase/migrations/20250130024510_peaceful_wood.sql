-- Drop existing trigger and function
DROP TRIGGER IF EXISTS create_vendor_after_profile ON public.profiles;
DROP FUNCTION IF EXISTS create_vendor_on_profile();

-- Create updated function that only sets required fields
CREATE OR REPLACE FUNCTION create_vendor_on_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'Vendor' THEN
    INSERT INTO public.vendors (user_id, vendor_name)
    VALUES (NEW.user_id, NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER create_vendor_after_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_vendor_on_profile();