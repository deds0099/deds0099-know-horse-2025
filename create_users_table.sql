-- Script para criar a tabela users se ela não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar e criar a tabela users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  isAdmin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para a tabela users
-- Política para select: todos podem ver
CREATE POLICY users_select_policy ON users
    FOR SELECT USING (true);

-- Política para insert: apenas o próprio usuário
CREATE POLICY users_insert_policy ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para update: apenas o próprio usuário
CREATE POLICY users_update_policy ON users
    FOR UPDATE USING (auth.uid() = id);

-- Política para delete: apenas o próprio usuário
CREATE POLICY users_delete_policy ON users
    FOR DELETE USING (auth.uid() = id);

-- Criar trigger para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 