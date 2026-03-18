import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (ou VITE_SUPABASE_SERVICE_ROLE_KEY) são obrigatórias.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

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
