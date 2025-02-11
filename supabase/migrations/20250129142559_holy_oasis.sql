-- Create vendors table
CREATE TABLE public.vendors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  vendor_name text,
  phone text,
  city text,
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES public.profiles (user_id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create policies for vendors table
CREATE POLICY "CupShup users can manage vendors"
  ON public.vendors
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND role = 'CupShup'
    )
  );

CREATE POLICY "Vendors can view own data"
  ON public.vendors
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to automatically create vendor record when profile is created
CREATE OR REPLACE FUNCTION create_vendor_on_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'Vendor' THEN
    INSERT INTO public.vendors (user_id, vendor_name, phone, city)
    VALUES (NEW.user_id, NEW.name, NEW.phone, NEW.city);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create vendor record
CREATE TRIGGER create_vendor_after_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_vendor_on_profile();