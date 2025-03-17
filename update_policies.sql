-- Remover TODAS as políticas existentes das tabelas
DROP POLICY IF EXISTS "Enable select for authenticated users" ON subscriptions;
DROP POLICY IF EXISTS "Enable select for all users" ON subscriptions;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON subscriptions;
DROP POLICY IF EXISTS "Enable insert for all users" ON subscriptions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON subscriptions;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON subscriptions;

-- Remover TODAS as políticas existentes da tabela news
DROP POLICY IF EXISTS "Enable select for authenticated users" ON news;
DROP POLICY IF EXISTS "Enable select for all users" ON news;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON news;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON news;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON news;

-- Dropar a tabela news se existir
DROP TABLE IF EXISTS news;

-- Criar a tabela news
CREATE TABLE news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para ambas as tabelas
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela news
-- Permitir que usuários anônimos e autenticados vejam notícias publicadas
CREATE POLICY "Enable select for all users"
ON news FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- Permitir que usuários autenticados vejam todas as notícias (incluindo rascunhos)
CREATE POLICY "Enable select for authenticated users"
ON news FOR SELECT
TO authenticated
USING (true);

-- Permitir que usuários autenticados criem notícias
CREATE POLICY "Enable insert for authenticated users"
ON news FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir que usuários autenticados atualizem notícias
CREATE POLICY "Enable update for authenticated users"
ON news FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Permitir que usuários autenticados excluam notícias
CREATE POLICY "Enable delete for authenticated users"
ON news FOR DELETE
TO authenticated
USING (true);

-- Políticas para a tabela subscriptions
CREATE POLICY "Enable select for authenticated users"
ON subscriptions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for all users"
ON subscriptions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON subscriptions FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON subscriptions FOR DELETE
TO authenticated
USING (true); 