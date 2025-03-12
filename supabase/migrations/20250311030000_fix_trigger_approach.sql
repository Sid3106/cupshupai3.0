-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the function for handling new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _role TEXT;
    _name TEXT;
BEGIN
    -- Log the start of function execution
    RAISE LOG 'handle_new_user starting for user % with metadata %', NEW.id, NEW.raw_user_meta_data;
    
    -- Get user details
    _role := COALESCE(NEW.raw_user_meta_data->>'role', 'Client');
    _name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    
    BEGIN
        -- Create profile entry
        INSERT INTO public.profiles (
            user_id,
            role,
            name,
            email,
            phone,
            city
        ) VALUES (
            NEW.id,
            _role::user_role,
            _name,
            NEW.email,
            CASE 
                WHEN NEW.raw_user_meta_data->>'phone' IS NOT NULL AND NEW.raw_user_meta_data->>'phone' != '' 
                THEN (NEW.raw_user_meta_data->>'phone')::bigint 
                ELSE NULL 
            END,
            NEW.raw_user_meta_data->>'city'
        );
        
        RAISE LOG 'Profile created successfully for user %', NEW.id;

        -- If user is a client, create client entry
        IF _role = 'Client' THEN
            INSERT INTO public.clients (
                user_id,
                brand_name,
                client_name
            ) VALUES (
                NEW.id,
                'Flipkart',
                _name
            );
            
            RAISE LOG 'Client entry created successfully for user %', NEW.id;
        END IF;

    EXCEPTION WHEN OTHERS THEN
        -- Log any errors
        RAISE LOG 'Error in handle_new_user for user %: % (SQLSTATE: %)', 
            NEW.id, SQLERRM, SQLSTATE;
        RAISE LOG 'Failed data: role=%, name=%, email=%, phone=%, city=%',
            _role, _name, NEW.email, NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'city';
        
        -- Re-raise the exception to see it in logs
        RAISE;
    END;

    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin; 