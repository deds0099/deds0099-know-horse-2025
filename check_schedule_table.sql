-- Verificar se a tabela schedule existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'schedule'
);

-- Listar as colunas se a tabela existir
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'schedule'
ORDER BY ordinal_position; 