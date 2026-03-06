INSERT INTO public.app_users (name, email, password, role)
VALUES ('Pedro AuroraTech', 'pedro@auroratech.com', 'AdminPitangueiras', 'ADMIN')
ON CONFLICT (email) DO UPDATE 
SET role = 'ADMIN', password = 'AdminPitangueiras';
