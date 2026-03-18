-- ============================================================
-- FIX: Adicionando colunas de pagamento faltantes
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Adicionar colunas faltantes na tabela minicourse_registrations
ALTER TABLE public.minicourse_registrations 
ADD COLUMN IF NOT EXISTS payment_id text,
ADD COLUMN IF NOT EXISTS payment_url text;

-- 2. Garantir que as colunas cpf e institution também existam (caso tenham sido puladas)
ALTER TABLE public.minicourse_registrations 
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS institution text;

-- 3. Recarregar o Schema Cache (Opcional, o Supabase geralmente faz sozinho)
-- NOTA: Se o erro persistir, tente clicar em "Reload Schema" no painel do Supabase API.
