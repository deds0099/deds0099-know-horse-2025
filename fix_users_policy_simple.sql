-- Script simplificado para corrigir a recursão infinita na política de segurança da tabela users

-- Desativar todas as políticas existentes para a tabela users
DROP POLICY IF EXISTS users_select_policy ON users;
DROP POLICY IF EXISTS users_insert_policy ON users;
DROP POLICY IF EXISTS users_update_policy ON users;
DROP POLICY IF EXISTS users_delete_policy ON users;

-- Remover políticas adicionais que possam existir (para garantir)
DROP POLICY IF EXISTS auth_policy ON users;
DROP POLICY IF EXISTS enable_row_level_security ON users;
DROP POLICY IF EXISTS authenticated_users_select ON users;
DROP POLICY IF EXISTS authenticated_users_insert ON users;
DROP POLICY IF EXISTS authenticated_users_update ON users;
DROP POLICY IF EXISTS authenticated_users_delete ON users;
DROP POLICY IF EXISTS all_users_select ON users;
DROP POLICY IF EXISTS all_users_insert ON users;
DROP POLICY IF EXISTS all_users_update ON users;
DROP POLICY IF EXISTS all_users_delete ON users;

-- Criar novas políticas simplificadas
-- Política para select: todos podem visualizar
CREATE POLICY users_select_policy ON users
    FOR SELECT USING (true);

-- Política para insert: apenas usuários autenticados
CREATE POLICY users_insert_policy ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para update: apenas o próprio usuário pode atualizar seus dados
CREATE POLICY users_update_policy ON users
    FOR UPDATE USING (auth.uid() = id);

-- Política para delete: apenas o próprio usuário pode excluir
CREATE POLICY users_delete_policy ON users
    FOR DELETE USING (auth.uid() = id);

-- Garantir que RLS esteja ativado
ALTER TABLE users ENABLE ROW LEVEL SECURITY; 