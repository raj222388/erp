-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert user into auth.users if they don't exist
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  '4e9dfc02-3f11-4a49-9c59-d6e246bbe4eb',
  'authenticated',
  'authenticated',
  'admin@gmail.com',
  crypt('admin@123', gen_salt('bf', 10)),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"name": "Admin User"}'::jsonb,
  now(),
  now(),
  false,
  false
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE lower(email) = 'admin@gmail.com'
);

-- Insert into auth.identities if they don't exist
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at,
  provider_id
)
SELECT
  '4e9dfc02-3f11-4a49-9c59-d6e246bbe4eb',
  '4e9dfc02-3f11-4a49-9c59-d6e246bbe4eb',
  jsonb_build_object('sub', '4e9dfc02-3f11-4a49-9c59-d6e246bbe4eb', 'email', 'admin@gmail.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now(),
  'admin@gmail.com'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.identities WHERE provider = 'email' AND (provider_id = 'admin@gmail.com' OR provider_id = 'Admin@gmail.com')
);

-- Insert user role mapping to admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = 'admin@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
