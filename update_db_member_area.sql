-- ============================================================
-- UPDATE: Adaptação para Área do Membro
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Adicionar user_id na tabela subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 2. Adicionar user_id na tabela minicourse_registrations
ALTER TABLE public.minicourse_registrations 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 3. Atualizar Políticas de RLS para subscriptions
DROP POLICY IF EXISTS "Public can select subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Public can insert subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Authenticated can read subscriptions" ON public.subscriptions;

-- Permite que o público insira (signup inicial)
CREATE POLICY "Public can insert subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (true);

-- Permite que usuários vejam suas próprias inscrições
CREATE POLICY "Users can select own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Admin continua vendo tudo
CREATE POLICY "Admins can select all subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (
    (SELECT (auth.jwt() ->> 'email')) IN ('thiago.souza@exemplo.com') -- Substitua pelo seu email admin ou lógica de role
    OR 
    (auth.jwt() ->> 'role' = 'service_role')
  );

-- 4. Criar função para verificar se o usuário é admin (opcional, mas recomendado)
-- Você pode definir quem é admin pelo email ou por uma tabela de perfis.
-- Por enquanto, vamos usar o email do JWT para simplificar.
