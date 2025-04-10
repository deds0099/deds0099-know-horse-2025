-- Remover a coluna instructor_photo_url da tabela minicourses
ALTER TABLE minicourses DROP COLUMN IF EXISTS instructor_photo_url;

-- Atualizar o cache do schema
NOTIFY pgrst, 'reload schema'; 