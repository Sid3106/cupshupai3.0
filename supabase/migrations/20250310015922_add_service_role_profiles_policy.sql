-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add policy to allow service role to insert into profiles table
CREATE POLICY "Allow service role to insert profiles" ON public.profiles
FOR INSERT TO service_role
WITH CHECK (true);

-- Add policy to allow service role to update profiles
CREATE POLICY "Allow service role to update profiles" ON public.profiles
FOR UPDATE TO service_role
USING (true)
WITH CHECK (true);

-- Add policy to allow service role to delete profiles
CREATE POLICY "Allow service role to delete profiles" ON public.profiles
FOR DELETE TO service_role
USING (true);
