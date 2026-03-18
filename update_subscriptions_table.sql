-- Adicionar a coluna 'institution' à tabela 'subscriptions'
ALTER TABLE subscriptions ADD COLUMN institution TEXT;

-- Remover a coluna 'payment_method' da tabela 'subscriptions'
ALTER TABLE subscriptions DROP COLUMN payment_method; 