-- ==============================================
-- SCRIPT COMPLETO DE BANCO DE DADOS
-- GAROTOS DO MARTINICA
-- ==============================================

-- Limpeza Inicial (Opcional: remove tabelas existentes para um começo limpo)
DROP TABLE IF EXISTS public.student_occurrences CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.app_users CASCADE;

-- 1. Tabela de Usuários do Sistema (app_users)
CREATE TABLE IF NOT EXISTS public.app_users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text UNIQUE,
    cpf text UNIQUE,
    password text NOT NULL,
    role text NOT NULL CHECK (role IN ('ADMIN', 'COMUM', 'RESPONSAVEL')),
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.app_users DISABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_users;

-- 2. Tabela de Planos
CREATE TABLE IF NOT EXISTS public.plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    price numeric(10, 2) NOT NULL,
    due_day integer NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.plans DISABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE public.plans;

-- 3. Tabela de Turmas (Groups)
CREATE TABLE IF NOT EXISTS public.groups (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;

-- 4. Tabela de Alunos (Students)
CREATE TABLE IF NOT EXISTS public.students (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    birth_date date,
    rg text,
    cpf text,
    phone text,
    medical_expiry date,
    photo_url text,
    address jsonb,
    guardian jsonb,
    plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
    group_ids uuid[],
    positions text[],
    active boolean DEFAULT true,
    documents jsonb,
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;

-- 5. Tabela de Transações Financeiras
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    description text NOT NULL,
    category text,
    amount numeric(10, 2) NOT NULL,
    type text NOT NULL CHECK (type IN ('RECEITA', 'DESPESA')),
    date date NOT NULL,
    payment_date date,
    status text NOT NULL CHECK (status IN ('PAGO', 'PENDENTE', 'ATRASADO', 'CANCELADO')),
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
    plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
    payment_method text CHECK (payment_method IN ('PIX', 'DINHEIRO', 'CARTAO', 'BOLETO', 'OUTRO')),
    payment_link text,
    external_reference text,
    preference_id text,
    recurrence text DEFAULT 'NONE' CHECK (recurrence IN ('NONE', 'MONTHLY')),
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- 6. Tabela de Atividades (Agenda)
CREATE TABLE IF NOT EXISTS public.activities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    activity_type text NOT NULL DEFAULT 'TRAINING' CHECK (activity_type IN ('TRAINING', 'GAME', 'EVENT', 'OTHER')),
    fee numeric(10, 2) DEFAULT 0,
    location text,
    presentation_time text,
    opponent text,
    home_score integer,
    away_score integer,
    scorers uuid[],
    group_id uuid REFERENCES public.groups(id) ON DELETE SET NULL,
    participants uuid[],
    date date NOT NULL,
    start_time text NOT NULL,
    end_time text,
    description text,
    recurrence text DEFAULT 'none' CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly')),
    attendance uuid[],
    fee_payments jsonb, -- {studentId: transactionId}
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;

-- 7. Tabela de Ocorrências de Alunos
CREATE TABLE IF NOT EXISTS public.student_occurrences (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    description text NOT NULL,
    date date NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.student_occurrences DISABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_occurrences;

-- ==============================================
-- INSERÇÃO DE DADOS DE AMOSTRA
-- ==============================================

-- Usuário Administrador
INSERT INTO public.app_users (name, email, cpf, password, role)
VALUES ('Admin Geral', 'admin@martinica.com', '00000000000', 'admin123', 'ADMIN');

-- Planos
INSERT INTO public.plans (id, name, price, due_day, description)
VALUES 
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Plano Básico', 100.00, 10, 'Acesso a 2 treinos por semana.'),
    ('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'Plano Completo', 150.00, 10, 'Acesso a todos os treinos da semana e amistosos.');

-- Turmas
INSERT INTO public.groups (id, name, description)
VALUES 
    ('c3d4e5f6-a7b8-9012-3456-7890abcdef12', 'Sub-10', 'Turma para crianças nascidas em 2014/2015.'),
    ('d4e5f6a7-b8c9-0123-4567-890abcdef123', 'Sub-12', 'Turma para crianças nascidas em 2012/2013.');

-- Alunos
INSERT INTO public.students (name, birth_date, cpf, phone, plan_id, group_ids, guardian)
VALUES 
    ('João da Silva', '2014-05-10', '11122233344', '51999998888', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', ARRAY['c3d4e5f6-a7b8-9012-3456-7890abcdef12']::uuid[], '{"name": "Carlos da Silva", "cpf": "55566677788", "phone": "51988887777"}'),
    ('Pedro Souza', '2012-08-22', '22233344455', '51977776666', 'b2c3d4e5-f6a7-8901-2345-67890abcdef1', ARRAY['d4e5f6a7-b8c9-0123-4567-890abcdef123']::uuid[], '{"name": "Ana Souza", "cpf": "88899900011", "phone": "51966665555"}');

-- Transação de Exemplo (Mensalidade Pendente)
INSERT INTO public.transactions (description, category, amount, type, date, status, student_id, plan_id, recurrence)
SELECT 
    'Mensalidade - ' || p.name,
    'Mensalidade',
    p.price,
    'RECEITA',
    make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, p.due_day),
    'PENDENTE',
    s.id,
    p.id,
    'MONTHLY'
FROM public.students s
JOIN public.plans p ON s.plan_id = p.id;

-- Atividade de Exemplo (Treino)
INSERT INTO public.activities (title, activity_type, location, group_id, date, start_time, end_time)
VALUES ('Treino Técnico', 'TRAINING', 'Campo Principal', 'c3d4e5f6-a7b8-9012-3456-7890abcdef12', CURRENT_DATE + interval '1 day', '16:00', '17:30');

-- Ocorrência de Exemplo
INSERT INTO public.student_occurrences (student_id, description, date)
SELECT id, 'Apresentou ótima evolução no treino de fundamentos.', CURRENT_DATE FROM public.students WHERE name = 'João da Silva';

