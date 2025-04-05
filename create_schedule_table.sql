-- Criar tabela de programação
CREATE TABLE IF NOT EXISTS schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  speaker TEXT,
  speaker_bio TEXT,
  date DATE,
  start_time TIME,
  end_time TIME,
  location TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Adicionar comentários para documentação
COMMENT ON TABLE schedule IS 'Tabela que armazena os itens da programação do evento';
COMMENT ON COLUMN schedule.id IS 'Identificador único do item da programação';
COMMENT ON COLUMN schedule.title IS 'Título do item da programação';
COMMENT ON COLUMN schedule.description IS 'Descrição do item da programação';
COMMENT ON COLUMN schedule.speaker IS 'Nome do palestrante ou apresentador (opcional)';
COMMENT ON COLUMN schedule.speaker_bio IS 'Biografia do palestrante (opcional)';
COMMENT ON COLUMN schedule.date IS 'Data do item da programação (opcional)';
COMMENT ON COLUMN schedule.start_time IS 'Horário de início (opcional)';
COMMENT ON COLUMN schedule.end_time IS 'Horário de término (opcional)';
COMMENT ON COLUMN schedule.location IS 'Local onde acontecerá (opcional)';
COMMENT ON COLUMN schedule.image_url IS 'URL da imagem relacionada ao item (opcional)';
COMMENT ON COLUMN schedule.is_published IS 'Indica se o item está publicado e visível no site';
COMMENT ON COLUMN schedule.published_at IS 'Data e hora de quando o item foi publicado';
COMMENT ON COLUMN schedule.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN schedule.updated_at IS 'Data e hora da última atualização do registro';

-- Criar índices para melhorar a performance de consultas frequentes
CREATE INDEX IF NOT EXISTS schedule_is_published_idx ON schedule (is_published);

-- Configurar políticas de segurança Row Level Security (RLS)
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública de itens publicados
CREATE POLICY schedule_select_policy ON schedule
  FOR SELECT
  USING (is_published = TRUE);

-- Política para permitir todas as operações para usuários autenticados (administradores)
CREATE POLICY schedule_admin_policy ON schedule
  FOR ALL
  USING (auth.role() = 'authenticated'); 