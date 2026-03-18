-- Desabilitar completamente RLS na tabela users para fins de desenvolvimento
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS users_select_policy ON users;
DROP POLICY IF EXISTS users_insert_policy ON users;
DROP POLICY IF EXISTS users_update_policy ON users;
DROP POLICY IF EXISTS users_delete_policy ON users;
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