/*
  # Create CupShup Admins Table

  1. New Tables
    - `cupshup_admins`
      - `user_id` (uuid, primary key)

  2. Security
    - Enable RLS on `cupshup_admins` table
    - Add policies for authenticated users to read data
*/

-- Create cupshup_admins table
CREATE TABLE public.cupshup_admins (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.cupshup_admins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view cupshup admins"
  ON public.cupshup_admins
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to automatically create cupshup_admin record when profile is created with CupShup role
CREATE OR REPLACE FUNCTION create_cupshup_admin_on_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'CupShup' THEN
    INSERT INTO public.cupshup_admins (user_id)
    VALUES (NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create cupshup_admin record
CREATE TRIGGER create_cupshup_admin_after_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_cupshup_admin_on_profile();