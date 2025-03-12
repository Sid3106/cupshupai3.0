-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the function with fixes for all identified issues
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public  -- Fix 1: Include both schemas in search path
AS $$
DECLARE
    _role TEXT;
    _name TEXT;
    _phone TEXT;
BEGIN
    -- Log the start of function execution
    RAISE LOG 'handle_auth_user_created starting for user % with metadata %', NEW.id, NEW.raw_user_meta_data;
    
    -- Get user details
    _role := COALESCE(NEW.raw_user_meta_data->>'role', 'Client');
    _name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
    _phone := NEW.raw_user_meta_data->>'phone';
    
    BEGIN
        -- Create profile entry
        INSERT INTO public.profiles (
            user_id,
            role,
            name,
            email,
            phone,  -- Fix 2: Handle phone data type correctly
            city
        ) VALUES (
            NEW.id,
            _role::user_role,
            _name,
            NEW.email,
            CASE WHEN _phone IS NOT NULL AND _phone != '' THEN _phone::bigint ELSE NULL END,  -- Fix 2: Safe casting
            NEW.raw_user_meta_data->>'city'
        );
        
        RAISE LOG 'Profile created successfully for user %', NEW.id;

        -- If user is a client, create client entry
        IF _role = 'Client' THEN
            INSERT INTO public.clients (
                user_id,
                brand_name,
                client_name  -- Fix 3: Include required client_name column
            ) VALUES (
                NEW.id,
                'Flipkart',
                _name        -- Fix 3: Use the same name for client_name
            );
            
            RAISE LOG 'Client entry created successfully for user %', NEW.id;
        END IF;
    
    EXCEPTION WHEN OTHERS THEN
        -- Fix 4: Enhanced error logging
        RAISE LOG 'Error in nested block of handle_auth_user_created for user %: % (SQLSTATE: %)', 
            NEW.id, SQLERRM, SQLSTATE;
        RAISE LOG 'Failed data: role=%, name=%, email=%, phone=%, city=%',
            _role, _name, NEW.email, _phone, NEW.raw_user_meta_data->>'city';
        -- Re-raise the exception to prevent silent failures
        RAISE EXCEPTION 'Failed to create profile/client: %', SQLERRM;
    END;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Fix 4: Enhanced error logging in the outer block
    RAISE LOG 'Error in outer block of handle_auth_user_created for user %: % (SQLSTATE: %)', 
        NEW.id, SQLERRM, SQLSTATE;
    
    -- Return NEW to allow the user creation to proceed even if profile/client creation fails
    RETURN NEW;
END;
$$;

-- Recreate the trigger with explicit schema reference
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_auth_user_created();  -- Fix 5: Explicit schema reference

-- Verify the trigger is created and enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE t.tgname = 'on_auth_user_created'
        AND n.nspname = 'auth'
        AND c.relname = 'users'
        AND t.tgenabled = 'O'
    ) THEN
        RAISE EXCEPTION 'Trigger was not created or is not enabled';
    END IF;
END;
$$; 