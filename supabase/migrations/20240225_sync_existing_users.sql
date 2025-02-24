-- Sync existing auth users to User table
INSERT INTO public."User" (id, email, name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email),
  COALESCE((au.raw_user_meta_data->>'role')::user_role, 'CANDIDATE')
FROM auth.users au
LEFT JOIN public."User" u ON u.id = au.id
WHERE u.id IS NULL; 