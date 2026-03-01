-- Adiciona a coluna avatar na tabela app_users se ela não existir
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS avatar text;
