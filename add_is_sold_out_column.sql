-- Adiciona a coluna is_sold_out na tabela minicourses
ALTER TABLE public.minicourses ADD COLUMN IF NOT EXISTS is_sold_out BOOLEAN DEFAULT false;
