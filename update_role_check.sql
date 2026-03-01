-- Remove a constraint antiga
ALTER TABLE public.app_users DROP CONSTRAINT IF EXISTS app_users_role_check;

-- Adiciona a nova constraint com os valores corretos
ALTER TABLE public.app_users ADD CONSTRAINT app_users_role_check 
CHECK (role IN ('ADMIN', 'PROFESSOR', 'RESPONSAVEL'));
