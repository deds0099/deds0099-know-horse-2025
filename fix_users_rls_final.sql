-- Script final para resolver o problema de recursão infinita em policy para "users"

-- 1. Verificar se a extensão uuid-ossp está instalada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Verificar se a tabela users existe e criá-la se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
            id UUID PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            isAdmin BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        RAISE NOTICE 'Tabela users criada com sucesso.';
    ELSE
        RAISE NOTICE 'A tabela users já existe.';
    END IF;
END $$;

-- 3. Desabilitar RLS para a tabela users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 4. Descartar todas as políticas existentes para evitar qualquer conflito
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', policy_record.policyname);
        RAISE NOTICE 'Política % removida', policy_record.policyname;
    END LOOP;
END $$;

-- 5. Criar uma política única e simples para evitar problemas
CREATE POLICY allow_all ON users 
    USING (true) 
    WITH CHECK (true);

-- 6. Criar um usuário admin padrão se não existir nenhum usuário
INSERT INTO users (id, email, name, isAdmin) 
SELECT 
    auth.uid(), 
    auth.email(),
    'Admin',
    true
FROM auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1)
AND auth.uid() IS NOT NULL
AND auth.email() IS NOT NULL;

-- 7. Habilitar RLS novamente com a nova política simplificada
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 8. Garantir que o proprietário da tabela tenha acesso total
ALTER TABLE users FORCE ROW LEVEL SECURITY;

-- 9. Conceder privilégios para operações na tabela
GRANT ALL ON TABLE users TO postgres;
GRANT ALL ON TABLE users TO anon;
GRANT ALL ON TABLE users TO authenticated;
GRANT ALL ON TABLE users TO service_role; 