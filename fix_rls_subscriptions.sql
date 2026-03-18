-- ============================================================
-- FIX: Ajuste de permissões para a tabela subscriptions
-- O erro 42501 ocorre porque, após o INSERT, o sistema tenta
-- ler os dados retornados (.select()), mas não há política de SELECT para o público.
-- ============================================================

-- 1. Permitir que o público (anon) também possa ler a tabela.
-- Isso é necessário para o comando .insert().select() funcionar.
DROP POLICY IF EXISTS "Public can select subscriptions" ON public.subscriptions;
CREATE POLICY "Public can select subscriptions"
  ON public.subscriptions FOR SELECT
  USING (true);

-- 2. Garantir que a política de insert está correta
DROP POLICY IF EXISTS "Public can insert subscriptions" ON public.subscriptions;
CREATE POLICY "Public can insert subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (true);

-- 3. (Opcional) Se você quiser mais segurança, pode restringir o SELECT 
-- mas para o formulário de cadastro funcionar com o retorno dos dados, 
-- o SELECT precisa estar habilitado.
