-- Script para adicionar a coluna vacancies_left à tabela minicourses se ela não existir
DO $$
BEGIN
    -- Verificar se a coluna vacancies_left existe
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'minicourses'
        AND column_name = 'vacancies_left'
    ) THEN
        -- Adicionar a coluna vacancies_left
        ALTER TABLE minicourses ADD COLUMN vacancies_left INTEGER;
        
        -- Atualizar a coluna vacancies_left com o mesmo valor da coluna vacancies para registros existentes
        UPDATE minicourses SET vacancies_left = vacancies;
        
        -- Adicionar índice para consultas comuns
        CREATE INDEX IF NOT EXISTS idx_minicourses_vacancies_left ON minicourses(vacancies_left);
        
        RAISE NOTICE 'Coluna vacancies_left adicionada com sucesso.';
    ELSE
        RAISE NOTICE 'A coluna vacancies_left já existe na tabela minicourses.';
    END IF;
END $$; 