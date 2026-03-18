-- ============================================================
-- FIX: Permissão de Administrativa para Atualizar Pagamentos
-- Resolve o problema do status "ficar pendente" sem dar erro
-- ============================================================

-- 1. Remover políticas de Update existentes para evitar conflitos
DROP POLICY IF EXISTS "Allow users to update own record" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can update all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Allow admin update" ON public.subscriptions;

-- 2. Criar política de UPDATE que permite:
--    a) O usuário logado atualizar seu próprio registro (ex: complementar dados)
--    b) Admins específicos atualizarem qualquer registro (ex: marcar como pago)
CREATE POLICY "Enable update for owners and admins"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'email') IN ('thiago.souza@exemplo.com', 'admin@knowhorse.com.br')
)
WITH CHECK (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'email') IN ('thiago.souza@exemplo.com', 'admin@knowhorse.com.br')
);

-- 3. Repetir para minicourse_registrations
DROP POLICY IF EXISTS "Allow users to update own registrations" ON public.minicourse_registrations;
DROP POLICY IF EXISTS "Enable update for owners and admins registrations" ON public.minicourse_registrations;

CREATE POLICY "Enable update for owners and admins registrations"
ON public.minicourse_registrations
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'email') IN ('thiago.souza@exemplo.com', 'admin@knowhorse.com.br')
)
WITH CHECK (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'email') IN ('thiago.souza@exemplo.com', 'admin@knowhorse.com.br')
);

-- 4. Garantir que o DELETE também siga a mesma lógica
DROP POLICY IF EXISTS "Enable delete for admins" ON public.subscriptions;
CREATE POLICY "Enable delete for admins"
ON public.subscriptions
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'email') IN ('thiago.souza@exemplo.com', 'admin@knowhorse.com.br'));

DROP POLICY IF EXISTS "Enable delete for admins regs" ON public.minicourse_registrations;
CREATE POLICY "Enable delete for admins regs"
ON public.minicourse_registrations
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'email') IN ('thiago.souza@exemplo.com', 'admin@knowhorse.com.br'));
