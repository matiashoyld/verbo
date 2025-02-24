-- Create function to update user role
CREATE OR REPLACE FUNCTION update_user_role(user_email TEXT, new_role user_role)
RETURNS void AS $$
BEGIN
  -- Update the user metadata in auth.users
  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object('role', new_role)
      ELSE 
        raw_user_meta_data || jsonb_build_object('role', new_role)
    END
  WHERE email = user_email;

  -- Update the role in the public.User table
  UPDATE "User"
  SET role = new_role
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 