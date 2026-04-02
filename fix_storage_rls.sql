-- =====================================================
-- FIX: Políticas RLS do Storage para bucket 'minicourses'
-- Execute no SQL Editor do Supabase
-- =====================================================

-- Remove políticas antigas (se existirem) para evitar conflito
DROP POLICY IF EXISTS "Public read minicourses" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload minicourses" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update minicourses" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete minicourses" ON storage.objects;

-- 1. Qualquer um pode VER/BAIXAR imagens do bucket minicourses
CREATE POLICY "Public read minicourses"
ON storage.objects FOR SELECT
USING (bucket_id = 'minicourses');

-- 2. Usuários autenticados podem fazer UPLOAD
CREATE POLICY "Authenticated upload minicourses"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'minicourses'
  AND auth.role() = 'authenticated'
);

-- 3. Usuários autenticados podem ATUALIZAR arquivos
CREATE POLICY "Authenticated update minicourses"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'minicourses'
  AND auth.role() = 'authenticated'
);

-- 4. Usuários autenticados podem DELETAR arquivos
CREATE POLICY "Authenticated delete minicourses"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'minicourses'
  AND auth.role() = 'authenticated'
);
