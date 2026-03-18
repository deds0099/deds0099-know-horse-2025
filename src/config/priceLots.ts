import { supabase } from '@/lib/supabase';

export interface PriceLot {
  id?: string;
  number: number;
  label: string;
  price: number;
  startDate: string;
  endDate: string;
  period?: string;
}

/** 
 * Busca os lotes de preço diretamente do Supabase.
 * Isso permite que o administrador altere os valores via painel.
 */
export const fetchPriceLots = async (): Promise<PriceLot[]> => {
  try {
    const { data, error } = await supabase
      .from('price_lots')
      .select('*')
      .order('number', { ascending: true });

    if (error) throw error;

    return data.map(lot => ({
      ...lot,
      startDate: lot.start_date,
      endDate: lot.end_date,
      period: `${new Date(lot.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${new Date(lot.end_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
    }));
  } catch (error) {
    console.error('Erro ao buscar lotes de preço:', error);
    // Fallback para os valores originais caso o banco falhe ou a tabela não exista ainda
    return [
      { number: 1, label: '1º LOTE', price: 200, startDate: '2026-03-04', endDate: '2026-04-13', period: '04/03 - 13/04' },
      { number: 2, label: '2º LOTE', price: 250, startDate: '2026-04-14', endDate: '2026-04-30', period: '14/04 - 30/04' },
      { number: 3, label: '3º LOTE', price: 300, startDate: '2026-05-01', endDate: '2026-05-08', period: '01/05 - 08/05' },
    ];
  }
};

/** Retorna o lote ativo com base na data atual. */
export const getActiveLotFromList = (lots: PriceLot[]): PriceLot | undefined => {
  const today = new Date();
  return lots.find((lot) => {
    const start = new Date(lot.startDate);
    const end = new Date(lot.endDate);
    end.setHours(23, 59, 59, 999);
    return today >= start && today <= end;
  });
};

// Mantemos o PRICE_LOTS estático como fallback inicial por compatibilidade, 
// mas o ideal é usar fetchPriceLots nas páginas.
export const PRICE_LOTS: PriceLot[] = [
  { number: 1, label: '1º LOTE', price: 200, startDate: '2026-03-04', endDate: '2026-04-13', period: '04/03 - 13/04' },
  { number: 2, label: '2º LOTE', price: 250, startDate: '2026-04-14', endDate: '2026-04-30', period: '14/04 - 30/04' },
  { number: 3, label: '3º LOTE', price: 300, startDate: '2026-05-01', endDate: '2026-05-08', period: '01/05 - 08/05' },
];
