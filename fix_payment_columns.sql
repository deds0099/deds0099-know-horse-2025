-- Adicionar colunas faltantes para integração com Mercado Pago
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS payment_id text,
ADD COLUMN IF NOT EXISTS payment_url text;

ALTER TABLE public.minicourse_registrations 
ADD COLUMN IF NOT EXISTS payment_id text,
ADD COLUMN IF NOT EXISTS payment_url text;

-- Garantir que as tabelas tenham user_id para vínculo com Auth
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

ALTER TABLE public.minicourse_registrations 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
