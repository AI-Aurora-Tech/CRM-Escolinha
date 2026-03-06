-- Tabela de Configurações do Aplicativo
CREATE TABLE IF NOT EXISTS public.app_settings (
    key text PRIMARY KEY,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);

-- Desabilita RLS para simplificar (ajuste conforme necessário para produção)
ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;

-- Adiciona ao Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;
