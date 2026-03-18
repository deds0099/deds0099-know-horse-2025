-- Script para verificar e adicionar todas as colunas necessárias na tabela minicourses
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Lista de colunas a serem verificadas e seus tipos
    -- Verificar coluna 'title'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'minicourses' AND column_name = 'title'
    ) THEN
        ALTER TABLE minicourses ADD COLUMN title VARCHAR(255);
        RAISE NOTICE 'Coluna title adicionada.';
    END IF;

    -- Verificar coluna 'description'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'minicourses' AND column_name = 'description'
    ) THEN
        ALTER TABLE minicourses ADD COLUMN description TEXT;
        RAISE NOTICE 'Coluna description adicionada.';
    END IF;

    -- Verificar coluna 'instructor'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'minicourses' AND column_name = 'instructor'
    ) THEN
        ALTER TABLE minicourses ADD COLUMN instructor VARCHAR(255);
        RAISE NOTICE 'Coluna instructor adicionada.';
    END IF;

    -- Verificar coluna 'location'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'minicourses' AND column_name = 'location'
    ) THEN
        ALTER TABLE minicourses ADD COLUMN location VARCHAR(255);
        RAISE NOTICE 'Coluna location adicionada.';
    END IF;

    -- Verificar coluna 'date'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'minicourses' AND column_name = 'date'
    ) THEN
        ALTER TABLE minicourses ADD COLUMN date VARCHAR(100) DEFAULT 'A definir';
        RAISE NOTICE 'Coluna date adicionada.';
    END IF;

    -- Verificar coluna 'time'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'minicourses' AND column_name = 'time'
    ) THEN
        ALTER TABLE minicourses ADD COLUMN time VARCHAR(100) DEFAULT 'A definir';
        RAISE NOTICE 'Coluna time adicionada.';
    END IF;

    -- Verificar coluna 'vacancies'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'minicourses' AND column_name = 'vacancies'
    ) THEN
        ALTER TABLE minicourses ADD COLUMN vacancies INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna vacancies adicionada.';
    END IF;

    -- Verificar coluna 'vacancies_left'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'minicourses' AND column_name = 'vacancies_left'
    ) THEN
        ALTER TABLE minicourses ADD COLUMN vacancies_left INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna vacancies_left adicionada.';
    END IF;

    -- Verificar coluna 'type'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'minicourses' AND column_name = 'type'
    ) THEN
        ALTER TABLE minicourses ADD COLUMN type VARCHAR(100);
        RAISE NOTICE 'Coluna type adicionada.';
    END IF;

    -- Verificar coluna 'theme'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'minicourses' AND column_name = 'theme'
    ) THEN
        ALTER TABLE minicourses ADD COLUMN theme VARCHAR(255);
        RAISE NOTICE 'Coluna theme adicionada.';
    END IF;

    -- Verificar coluna 'price'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'minicourses' AND column_name = 'price'
    ) THEN
        ALTER TABLE minicourses ADD COLUMN price DECIMAL(10, 2) DEFAULT 0;
        RAISE NOTICE 'Coluna price adicionada.';
    END IF;

    -- Verificar coluna 'image_url'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'minicourses' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE minicourses ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Coluna image_url adicionada.';
    END IF;

    -- Verificar coluna 'is_published'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'minicourses' AND column_name = 'is_published'
    ) THEN
        ALTER TABLE minicourses ADD COLUMN is_published BOOLEAN DEFAULT false;
        RAISE NOTICE 'Coluna is_published adicionada.';
    END IF;

    -- Verificar coluna 'created_at'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'minicourses' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE minicourses ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna created_at adicionada.';
    END IF;

    -- Verificar coluna 'updated_at'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'minicourses' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE minicourses ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna updated_at adicionada.';
    END IF;

    -- Verificar coluna 'published_at'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'minicourses' AND column_name = 'published_at'
    ) THEN
        ALTER TABLE minicourses ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Coluna published_at adicionada.';
    END IF;

    -- Atualizar vacancies_left para ser igual a vacancies onde for NULL
    UPDATE minicourses SET vacancies_left = vacancies WHERE vacancies_left IS NULL;
    
    RAISE NOTICE 'Verificação e adição de colunas concluída com sucesso.';
END $$; 