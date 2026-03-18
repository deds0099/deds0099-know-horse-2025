-- ============================================================
-- FIX DEFINITIVO: Reset e Ajuste de RLS (subscriptions)
-- Execute este script para resolver o erro "new row violates row-level security policy"
-- ============================================================

-- 1. Limpeza total de políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Public can insert subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Public can select subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can select own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Authenticated can read subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Authenticated can update subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Authenticated can delete subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Authenticated full access subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can select all subscriptions" ON public.subscriptions;

-- 2. Política de INSERÇÃO (Permite que qualquer pessoa se inscreva)
CREATE POLICY "Allow public insert"
  ON public.subscriptions FOR INSERT
  WITH CHECK (true);

-- 3. Política de LEITURA (SELECT)
-- Para que o formulário funcione (.insert().select()), 
-- precisamos permitir que o usuário leia o que acabou de criar.
-- Vamos permitir leitura pública por enquanto para garantir o funcionamento.
CREATE POLICY "Allow public select"
  ON public.subscriptions FOR SELECT
  USING (true);

-- 4. Política de ATUALIZAÇÃO (Apenas Admin ou o próprio usuário logado)
CREATE POLICY "Allow users to update own record"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Mesma lógica para minicursos (evitar erros futuros)
DROP POLICY IF EXISTS "Public can insert minicourse registrations" ON public.minicourse_registrations;
DROP POLICY IF EXISTS "Public can read own minicourse registrations" ON public.minicourse_registrations;
DROP POLICY IF EXISTS "Authenticated full access minicourse registrations" ON public.minicourse_registrations;

CREATE POLICY "Allow public insert registrations"
  ON public.minicourse_registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public select registrations"
  ON public.minicourse_registrations FOR SELECT
  USING (true);
