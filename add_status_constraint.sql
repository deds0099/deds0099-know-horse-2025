-- Adicionar a restrição valid_status para a coluna status
ALTER TABLE subscriptions 
ADD CONSTRAINT valid_status 
CHECK (status IN ('pending', 'paid')); 