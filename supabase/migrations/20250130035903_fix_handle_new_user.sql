-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the existing function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the updated function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_role user_role;
  v_name text;
  v_phone bigint;
BEGIN
  -- Log the incoming data
  RAISE NOTICE 'handle_new_user called with user_id: %, email: %, metadata: %',
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data;

  -- Determine role from metadata
  IF NEW.raw_user_meta_data->>'role' = 'Vendor' THEN
    v_role := 'Vendor'::user_role;
  ELSIF NEW.raw_user_meta_data->>'role' = 'Client' THEN
    v_role := 'Client'::user_role;
  ELSE
    v_role := 'CupShup'::user_role;
  END IF;

  -- Get name from metadata or fallback to email
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));

  -- Convert phone to bigint if present
  BEGIN
    IF NEW.raw_user_meta_data->>'phone' IS NOT NULL THEN
      v_phone := (NEW.raw_user_meta_data->>'phone')::bigint;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error converting phone number: %', NEW.raw_user_meta_data->>'phone';
    v_phone := NULL;
  END;

  -- Insert into profiles with error handling
  BEGIN
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
      v_phone,
      NEW.raw_user_meta_data->>'city'
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error inserting into profiles: %', SQLERRM;
    RETURN NULL;
  END;

  -- If this is a vendor, create vendor record
  IF v_role = 'Vendor'::user_role THEN
    BEGIN
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
        v_phone,
        NEW.raw_user_meta_data->>'city',
        'Active'
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error inserting into vendors: %', SQLERRM;
      -- Don't return NULL here, as the profile was already created
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user(); 