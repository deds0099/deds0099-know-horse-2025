import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Configuração do Supabase com URL fornecida
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ysjbjbjvlxrdonyccqer.supabase.co';
// Configuração da chave anônima
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzamJqYmp2bHhyZG9ueWNjcWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MjEzMjIsImV4cCI6MjA1NzI5NzMyMn0.XOr19WwAScNCCJAbkJsirsLRWXsQT0PQvY_n7TBRn4Y';

console.log('Inicializando cliente Supabase com:', { 
  url: supabaseUrl,
  keyLength: supabaseAnonKey.length 
});

// Esta configuração permite que a aplicação se conecte ao Supabase
// Importante: Em produção, você deve configurar as variáveis de ambiente corretamente
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Função para testar a conexão
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
    
    console.log('Conexão com Supabase estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return false;
  }
};

// Testar conexão ao inicializar
testConnection();

// Função auxiliar para verificar se as credenciais reais estão configuradas
export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder-url.supabase.co'
  );
};
