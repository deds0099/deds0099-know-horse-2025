-- Criar tabela de lotes de preço para o congresso
CREATE TABLE IF NOT EXISTS public.price_lots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number INTEGER NOT NULL,
    label TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.price_lots ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Public can read price lots" 
    ON public.price_lots FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated can manage price lots" 
    ON public.price_lots FOR ALL 
    TO authenticated 
    USING (true);

-- Inserir lotes iniciais baseados no config atual
INSERT INTO public.price_lots (number, label, price, start_date, end_date)
VALUES 
(1, '1º LOTE', 200.00, '2025-03-04T00:00:00Z', '2025-04-13T23:59:59Z'),
(2, '2º LOTE', 250.00, '2025-04-14T00:00:00Z', '2025-04-30T23:59:59Z'),
(3, '3º LOTE', 300.00, '2025-05-01T00:00:00Z', '2025-05-08T23:59:59Z')
ON CONFLICT DO NOTHING;
