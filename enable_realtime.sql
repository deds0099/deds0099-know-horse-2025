-- ============================================================
-- FIX: Habilitando Realtime (Replicação) no Supabase
-- Sem isso, o Dashboard não atualiza sozinho quando o Admin muda o status
-- ============================================================

-- 1. Garante que as tabelas estão na publicação de Realtime do Supabase
BEGIN;
  -- Remove se já existir para limpar
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.subscriptions;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.minicourse_registrations;
  
  -- Adiciona as tabelas novamente
  ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.minicourse_registrations;
COMMIT;

-- 2. DICA DE VERIFICAÇÃO:
-- Certifique-se de que a coluna 'user_id' está preenchida na linha que você está testando.
-- Se a inscrição foi feita ANTES de implementarmos a Área do Membro, ela não aparecerá no dashboard
-- até que você coloque o ID do usuário nela manualmente no banco de dados.
