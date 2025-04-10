-- Adicionar a coluna instructor_photo_url à tabela minicourses
ALTER TABLE minicourses ADD COLUMN IF NOT EXISTS instructor_photo_url TEXT;

-- Atualizar o cache do schema
NOTIFY pgrst, 'reload schema'; 