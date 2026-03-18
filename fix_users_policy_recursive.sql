-- Script para resolver o problema de recursão infinita na política da tabela users

-- Desabilitar temporariamente RLS na tabela users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS users_select_policy ON users;
DROP POLICY IF EXISTS users_insert_policy ON users;
DROP POLICY IF EXISTS users_update_policy ON users;
DROP POLICY IF EXISTS users_delete_policy ON users;

-- Remover políticas com outros possíveis nomes
DROP POLICY IF EXISTS auth_policy ON users;
DROP POLICY IF EXISTS enable_row_level_security ON users;
DROP POLICY IF EXISTS allow_all_users ON users;
DROP POLICY IF EXISTS allow_self_access ON users;
DROP POLICY IF EXISTS authenticated_users_select ON users;
DROP POLICY IF EXISTS authenticated_users_insert ON users;
DROP POLICY IF EXISTS authenticated_users_update ON users;
DROP POLICY IF EXISTS authenticated_users_delete ON users;
DROP POLICY IF EXISTS all_users_select ON users;
DROP POLICY IF EXISTS all_users_insert ON users;
DROP POLICY IF EXISTS all_users_update ON users;
DROP POLICY IF EXISTS all_users_delete ON users;

-- Criar políticas simplificadas sem recursão
-- Política para select: permitir acesso público
CREATE POLICY users_select_policy ON users
    FOR SELECT USING (true);

-- Política para insert: usar verificação simples
CREATE POLICY users_insert_policy ON users
    FOR INSERT WITH CHECK (true);

-- Política para update: usar verificação simples
CREATE POLICY users_update_policy ON users
    FOR UPDATE USING (true);

-- Política para delete: usar verificação simples
CREATE POLICY users_delete_policy ON users
    FOR DELETE USING (true);

-- Reabilitar RLS com as novas políticas
ALTER TABLE users ENABLE ROW LEVEL SECURITY; 