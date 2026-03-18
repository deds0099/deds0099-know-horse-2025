-- Solução simplificada para o problema de recursão infinita em policy para "users"

-- 1. Desabilitar RLS para a tabela users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS users_select_policy ON users;
DROP POLICY IF EXISTS users_insert_policy ON users;
DROP POLICY IF EXISTS users_update_policy ON users;
DROP POLICY IF EXISTS users_delete_policy ON users;
DROP POLICY IF EXISTS auth_policy ON users;
DROP POLICY IF EXISTS enable_row_level_security ON users;
DROP POLICY IF EXISTS allow_all_users ON users;
DROP POLICY IF EXISTS allow_all ON users;
DROP POLICY IF EXISTS allow_self_access ON users;

-- 3. Adicionar uma única política simples
CREATE POLICY allow_all ON users FOR ALL USING (true);

-- 4. Habilitar RLS novamente com a nova política simplificada
ALTER TABLE users ENABLE ROW LEVEL SECURITY; 