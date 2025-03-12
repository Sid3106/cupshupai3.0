-- Create a trigger function to create a client entry when a profile with role 'Client' is created
CREATE OR REPLACE FUNCTION public.create_client_on_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create client entry if the profile has role 'Client'
  IF NEW.role = 'Client' THEN
    BEGIN
      INSERT INTO public.clients (
        user_id,
        brand_name,
        client_name,
        phone,
        city,
        created_at
      ) VALUES (
        NEW.user_id,
        'Flipkart', -- Hardcoded brand name as per strategy
        NEW.name,
        NEW.phone::text, -- Cast phone to text since it's stored as bigint in profiles
        NEW.city,
        NOW()
      );
      EXCEPTION WHEN OTHERS THEN
        -- Log error details but don't prevent profile creation
        RAISE WARNING 'Error creating client entry: %', SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS create_client_on_profile_trigger ON public.profiles;
CREATE TRIGGER create_client_on_profile_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_client_on_profile();
