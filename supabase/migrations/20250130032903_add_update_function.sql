/*
  # Add stored procedure to update handle_new_user function

  1. Changes
    - Create stored procedure to update handle_new_user function
    - Allow authenticated users to execute the procedure
*/

-- Create stored procedure to update handle_new_user function
CREATE OR REPLACE FUNCTION update_handle_new_user_function(function_definition text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE function_definition;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_handle_new_user_function(text) TO authenticated; 