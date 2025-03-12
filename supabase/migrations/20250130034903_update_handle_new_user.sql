-- Update handle_new_user function to handle both vendor and client invites
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_role user_role;
  v_name text;
BEGIN
  -- Determine role from metadata
  IF NEW.user_metadata->>'role' = 'Vendor' THEN
    v_role := 'Vendor'::user_role;
  ELSIF NEW.user_metadata->>'role' = 'Client' THEN
    v_role := 'Client'::user_role;
  ELSE
    v_role := 'CupShup'::user_role;
  END IF;

  -- Get name from metadata or fallback to email
  v_name := COALESCE(NEW.user_metadata->>'name', split_part(NEW.email, '@', 1));

  -- Insert into profiles
  INSERT INTO public.profiles (
    user_id,
    role,
    name,
    email,
    phone,
    city
  )
  VALUES (
    NEW.id,
    v_role,
    v_name,
    NEW.email,
    (NEW.user_metadata->>'phone')::bigint,
    NEW.user_metadata->>'city'
  );

  -- If this is a vendor, trigger vendor creation
  IF v_role = 'Vendor'::user_role THEN
    INSERT INTO public.vendors (
      user_id,
      name,
      email,
      phone,
      city,
      status
    )
    VALUES (
      NEW.id,
      v_name,
      NEW.email,
      (NEW.user_metadata->>'phone')::bigint,
      NEW.user_metadata->>'city',
      'Active'
    );
  END IF;

  RETURN NEW;
END;
$$; 