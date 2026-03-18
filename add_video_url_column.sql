-- Adicionar coluna video_url à tabela news
ALTER TABLE news ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Atualizar as políticas para incluir a nova coluna
DROP POLICY IF EXISTS "Enable select for all users" ON news;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON news;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON news;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON news;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON news;

-- Recriar as políticas
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