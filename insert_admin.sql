INSERT INTO public.app_users (name, email, password, role)
VALUES ('Admin Pitangueiras', 'admin@pitangueiras.com', 'Pitangueiras2024', 'ADMIN')
ON CONFLICT (email) DO UPDATE 
SET role = 'ADMIN';
