-- Adiciona a coluna lineup na tabela activities se ela não existir
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS lineup jsonb;
