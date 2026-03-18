-- Habilitar a extensão uuid-ossp se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Script para criar a tabela de minicursos
CREATE TABLE IF NOT EXISTS minicourses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255),
  location VARCHAR(255),
  date VARCHAR(100) DEFAULT 'A definir',
  time VARCHAR(100) DEFAULT 'A definir',
  vacancies INTEGER NOT NULL,
  vacancies_left INTEGER,
  type VARCHAR(100),
  theme VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Adicionar índices para consultas comuns
CREATE INDEX IF NOT EXISTS idx_minicourses_is_published ON minicourses(is_published);
CREATE INDEX IF NOT EXISTS idx_minicourses_vacancies_left ON minicourses(vacancies_left);

-- Script para criar a tabela de inscrições em minicursos
CREATE TABLE IF NOT EXISTS minicourse_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  minicourse_id UUID NOT NULL REFERENCES minicourses(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  cpf VARCHAR(20) NOT NULL,
  phone VARCHAR(20),
  institution VARCHAR(255),
  is_paid BOOLEAN DEFAULT false,
  payment_id VARCHAR(255),
  payment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Adicionar índices para consultas comuns
CREATE INDEX IF NOT EXISTS idx_minicourse_registrations_minicourse_id ON minicourse_registrations(minicourse_id);
CREATE INDEX IF NOT EXISTS idx_minicourse_registrations_is_paid ON minicourse_registrations(is_paid);
CREATE INDEX IF NOT EXISTS idx_minicourse_registrations_email ON minicourse_registrations(email);

-- Verificar e corrigir a coluna vacancies_left se necessário
DO $$
BEGIN
    -- Verificar se a coluna vacancies_left existe
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'minicourses'
        AND column_name = 'vacancies_left'
    ) THEN
        -- Atualizar valores onde vacancies_left está NULL
        UPDATE minicourses 
        SET vacancies_left = vacancies 
        WHERE vacancies_left IS NULL;
        
        RAISE NOTICE 'Valores de vacancies_left atualizados onde necessário.';
    END IF;
END $$; 