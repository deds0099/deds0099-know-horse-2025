-- Script para corrigir a recursão infinita na política de segurança da tabela users
DO $$
BEGIN
    -- Primeiro, listar todas as políticas existentes para a tabela users
    RAISE NOTICE 'Políticas existentes para a tabela users:';
    FOR r IN (
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'users'
    ) LOOP
        RAISE NOTICE 'Política: %', r.policyname;
    END LOOP;

    -- Desativar todas as políticas para a tabela users
    FOR r IN (
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'users'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', r.policyname);
        RAISE NOTICE 'Política % removida', r.policyname;
    END LOOP;

    -- Criar novas políticas simplificadas
    -- Política para select: todos podem visualizar
    CREATE POLICY users_select_policy ON users
        FOR SELECT USING (true);
    RAISE NOTICE 'Política users_select_policy criada';

    -- Política para insert: apenas usuários autenticados
    CREATE POLICY users_insert_policy ON users
        FOR INSERT WITH CHECK (auth.uid() = id);
    RAISE NOTICE 'Política users_insert_policy criada';

    -- Política para update: apenas o próprio usuário pode atualizar seus dados
    CREATE POLICY users_update_policy ON users
        FOR UPDATE USING (auth.uid() = id);
    RAISE NOTICE 'Política users_update_policy criada';

    -- Política para delete: apenas o próprio usuário pode excluir
    CREATE POLICY users_delete_policy ON users
        FOR DELETE USING (auth.uid() = id);
    RAISE NOTICE 'Política users_delete_policy criada';

    -- Garantir que RLS esteja ativado
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS ativado para a tabela users';

    RAISE NOTICE 'Correção das políticas de segurança concluída com sucesso.';
END $$; 