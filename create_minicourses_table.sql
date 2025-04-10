-- Desabilitar RLS e remover políticas existentes para evitar erros
ALTER TABLE IF EXISTS minicourses DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON minicourses;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON minicourses;
DROP POLICY IF EXISTS "Enable update for users based on email" ON minicourses;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON minicourses;

-- Recriar a tabela de minicursos
DROP TABLE IF EXISTS minicourses CASCADE;

CREATE TABLE minicourses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    instructor TEXT NOT NULL,
    instructor_photo_url TEXT,
    location TEXT,
    date TEXT DEFAULT 'A definir',
    time TEXT DEFAULT 'A definir',
    vacancies INTEGER NOT NULL,
    vacancies_left INTEGER NOT NULL,
    type TEXT NOT NULL,
    theme TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE
);

-- Criar índices para melhor performance
CREATE INDEX idx_minicourses_is_published ON minicourses(is_published);
CREATE INDEX idx_minicourses_vacancies_left ON minicourses(vacancies_left); 