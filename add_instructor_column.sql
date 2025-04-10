-- Script para adicionar a coluna instructor à tabela minicourses
DO $$
BEGIN
    -- Verificar se a coluna instructor existe
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'minicourses'
        AND column_name = 'instructor'
    ) THEN
        -- Adicionar a coluna instructor
        ALTER TABLE minicourses ADD COLUMN instructor VARCHAR(255);
        RAISE NOTICE 'Coluna instructor adicionada à tabela minicourses.';
    ELSE
        RAISE NOTICE 'A coluna instructor já existe na tabela minicourses.';
    END IF;
END $$; 