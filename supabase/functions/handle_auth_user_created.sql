-- Function to handle user creation in auth.users
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER AS $$
DECLARE
  _role text;
  _name text;
  _phone text;
BEGIN
  -- Extract metadata from the raw_user_meta_data
  _role := NEW.raw_user_meta_data->>'role';
  _name := NEW.raw_user_meta_data->>'name';
  _phone := NEW.raw_user_meta_data->>'phone';

  -- Create profile entry only
  BEGIN
    INSERT INTO public.profiles (
      user_id,
      role,
      name,
      email,
      phone,
      city,
      raw_user_meta_data
    ) VALUES (
      NEW.id,
      _role::user_role,
      _name,
      NEW.email,
      CASE 
        WHEN _phone ~ '^\d+$' THEN _phone::bigint 
        ELSE NULL 
      END,
      NEW.raw_user_meta_data->>'city',
      NEW.raw_user_meta_data
    );
    EXCEPTION WHEN OTHERS THEN
      -- Log error details but don't prevent auth user creation
      RAISE WARNING 'Error creating profile: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_created();
