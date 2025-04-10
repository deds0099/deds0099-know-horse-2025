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