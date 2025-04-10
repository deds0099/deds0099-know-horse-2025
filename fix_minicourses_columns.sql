-- Script para adicionar a coluna image_url e modificar colunas title e description para serem opcionais
DO $$
BEGIN
    -- Verificar se a coluna image_url existe
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'minicourses'
        AND column_name = 'image_url'
    ) THEN
        -- Adicionar a coluna image_url
        ALTER TABLE minicourses ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Coluna image_url adicionada à tabela minicourses.';
    ELSE
        RAISE NOTICE 'A coluna image_url já existe na tabela minicourses.';
    END IF;

    -- Modificar a coluna title para ser opcional (retirar o NOT NULL)
    BEGIN
        ALTER TABLE minicourses ALTER COLUMN title DROP NOT NULL;
        RAISE NOTICE 'Coluna title modificada para ser opcional.';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Não foi possível modificar a coluna title ou ela já é opcional.';
    END;

    -- Verificar se a coluna description existe
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'minicourses'
        AND column_name = 'description'
    ) THEN
        -- Adicionar a coluna description se não existir
        ALTER TABLE minicourses ADD COLUMN description TEXT;
        RAISE NOTICE 'Coluna description adicionada à tabela minicourses.';
    ELSE
        RAISE NOTICE 'A coluna description já existe na tabela minicourses.';
    END IF;
END $$; 