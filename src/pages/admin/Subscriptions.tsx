import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, X, Search, ArrowUp, ArrowDown, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Subscription = {
  id: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  status: string;
  is_paid: boolean;
  created_at: string;
  paid_at: string | null;
  updated_at: string;
  cpf: string;
  minicourse_id?: string;
  minicourse_title?: string;
  type?: 'subscription' | 'minicourse';
};

// Função para formatar a data
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('pt-BR', options);
};

const fetchSubscriptions = async () => {
  try {
    console.log('Iniciando busca de inscrições...');
    
    // Verifica se há uma sessão ativa
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Erro ao verificar sessão:', sessionError);
      throw new Error('Erro ao verificar autenticação');
    }

    if (!session) {
      console.error('Usuário não está autenticado');
      throw new Error('Você precisa estar logado para ver as inscrições');
    }

    console.log('Sessão válida, buscando inscrições...');
    
    // Busca as inscrições regulares
    const { data: regularSubscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar inscrições:', error);
      if (error.code === 'PGRST301') {
        throw new Error('Erro de conexão com o banco de dados');
      } else if (error.code === '42501') {
        throw new Error('Você não tem permissão para ver as inscrições');
      } else {
        throw new Error(`Erro ao buscar inscrições: ${error.message}`);
      }
    }

    // Formatar inscrições regulares
    const formattedRegularSubscriptions = (regularSubscriptions || []).map(sub => ({
      ...sub,
      type: 'subscription' as const
    }));
    
    // Busca as inscrições de minicursos com join para obter o título
    const { data: minicourseRegistrations, error: minicourseError } = await supabase
      .from('minicourse_registrations')
      .select(`
        *,
        minicourses:minicourse_id (
          title
        )
      `)
      .order('created_at', { ascending: false });
      
    if (minicourseError) {
      console.error('Erro ao buscar inscrições de minicursos:', minicourseError);
      throw new Error(`Erro ao buscar inscrições de minicursos: ${minicourseError.message}`);
    }
    
    // Formatar inscrições de minicursos
    const formattedMinicourseRegistrations = (minicourseRegistrations || []).map(reg => ({
      id: reg.id,
      name: reg.name,
      email: reg.email,
      phone: reg.phone || '',
      institution: reg.institution || '',
      status: reg.is_paid ? 'active' : 'pending',
      is_paid: reg.is_paid,
      created_at: reg.created_at,
      paid_at: reg.paid_at,
      updated_at: reg.updated_at,
      cpf: reg.cpf,
      minicourse_id: reg.minicourse_id,
      minicourse_title: reg.minicourses?.title || 'Minicurso sem título',
      type: 'minicourse' as const
    }));
    
    // Combinar as inscrições e ordenar por data de criação
    const allSubscriptions = [
      ...formattedRegularSubscriptions,
      ...formattedMinicourseRegistrations
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    console.log('Total de inscrições encontradas:', allSubscriptions.length);
    return allSubscriptions;
  } catch (error) {
    console.error('Erro detalhado ao buscar inscrições:', error);
    throw error;
  }
};

const updatePaymentStatus = async (id: string, isPaid: boolean, type?: 'subscription' | 'minicourse') => {
  try {
    console.log('Tentando atualizar status de pagamento:', { id, isPaid, type });
    
    if (type === 'minicourse') {
      // Primeiro, buscar a inscrição para obter o minicourse_id
      const { data: registration, error: fetchError } = await supabase
        .from('minicourse_registrations')
        .select('*, minicourse_id')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('Erro ao buscar inscrição de minicurso:', fetchError);
        throw new Error(`Erro ao buscar inscrição: ${fetchError.message}`);
      }
      
      if (!registration) {
        throw new Error('Inscrição de minicurso não encontrada');
      }
      
      const updates = {
        is_paid: isPaid,
        paid_at: isPaid ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };
      
      // Atualiza o status de pagamento
      const { error: updateError } = await supabase
        .from('minicourse_registrations')
        .update(updates)
        .eq('id', id);
        
      if (updateError) {
        console.error('Erro ao atualizar status:', updateError);
        throw new Error(`Erro ao atualizar status: ${updateError.message}`);
      }
      
      // Não alteramos o número de vagas aqui porque a vaga já foi ocupada no momento da inscrição
      // A vaga só é devolvida quando a inscrição é excluída
      
      return true;
    } else {
      // Lógica para inscrições regulares do congresso
      const { error } = await supabase
        .from('subscriptions')
        .update({
          is_paid: isPaid,
          paid_at: isPaid ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) {
        console.error('Erro ao atualizar status:', error);
        throw new Error(`Erro ao atualizar status: ${error.message}`);
      }
      
      return true;
    }
  } catch (error) {
    console.error('Erro ao atualizar status de pagamento:', error);
    throw error;
  }
};

const deleteSubscription = async (id: string, type?: 'subscription' | 'minicourse') => {
  try {
    console.log('Tentando remover inscrição:', { id, type });
    
    if (type === 'minicourse') {
      // Primeiro, buscar a inscrição para obter o minicourse_id
      const { data: registration, error: fetchError } = await supabase
        .from('minicourse_registrations')
        .select('*, minicourse_id')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('Erro ao buscar inscrição de minicurso:', fetchError);
        throw new Error(`Erro ao buscar inscrição: ${fetchError.message}`);
      }
      
      if (!registration) {
        throw new Error('Inscrição de minicurso não encontrada');
      }

      // Buscar o minicurso para obter o número atual de vagas
      const { data: minicourse, error: minicourseError } = await supabase
        .from('minicourses')
        .select('vacancies_left')
        .eq('id', registration.minicourse_id)
        .single();

      if (minicourseError) {
        console.error('Erro ao buscar minicurso:', minicourseError);
        throw new Error(`Erro ao buscar minicurso: ${minicourseError.message}`);
      }

      if (!minicourse) {
        throw new Error('Minicurso não encontrado');
      }
      
      // Remove a inscrição
      const { error: deleteError } = await supabase
        .from('minicourse_registrations')
        .delete()
        .eq('id', id);
        
      if (deleteError) {
        console.error('Erro ao remover inscrição:', deleteError);
        throw new Error(`Erro ao remover inscrição: ${deleteError.message}`);
      }
      
      // Sempre devolver a vaga ao minicurso quando uma inscrição é excluída
      if (registration.minicourse_id) {
        // Atualizar o número de vagas disponíveis
        const { error: updateError } = await supabase
          .from('minicourses')
          .update({ 
            vacancies_left: minicourse.vacancies_left + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', registration.minicourse_id);
          
        if (updateError) {
          console.error('Erro ao atualizar vagas disponíveis:', updateError);
          throw new Error(`Erro ao atualizar vagas disponíveis: ${updateError.message}`);
        }
      }
    } else {
      console.log('Removendo inscrição regular do congresso...');
      // Remover inscrição regular
      const { data, error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .select();
        
      if (error) {
        console.error('Erro ao remover inscrição:', error);
        throw new Error(`Erro ao remover inscrição: ${error.message}`);
      }
      
      console.log('Inscrição removida com sucesso:', data);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao remover inscrição:', error);
    throw error;
  }
};

const fetchData = async () => {
  try {
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        minicourse_registrations (
          id,
          name,
          email,
          phone,
          minicourse_id,
          is_paid,
          created_at,
          minicourses (
            id,
            title,
            instructor,
            date,
            time,
            location,
            vacancies_left
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (subscriptionsError) throw subscriptionsError;

    // Processar os dados para exibição
    const processedData = subscriptions.map(sub => {
      if (sub.type === 'minicourse' && sub.minicourse_registrations) {
        const registration = sub.minicourse_registrations[0];
        return {
          ...sub,
          name: registration.name,
          email: registration.email,
          phone: registration.phone,
          minicourse: registration.minicourses
        };
      }
      return sub;
    });

    setData(processedData);
  } catch (error) {
    console.error('Erro ao buscar inscrições:', error);
    toast.error('Erro ao carregar inscrições');
  }
};

const AdminSubscriptions = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof Subscription>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    data: subscriptions = [], 
    isLoading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: fetchSubscriptions,
    enabled: !!user,
    refetchInterval: 5000 // Atualiza a cada 5 segundos
  });
  
  useEffect(() => {
    if (queryError) {
      toast.error('Erro ao carregar inscrições');
      console.error(queryError);
    }
  }, [queryError]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast.error('Você precisa estar logado para acessar esta página');
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);
  
  const handleSort = (field: keyof Subscription) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  const handlePaymentStatusChange = async (id: string, isPaid: boolean) => {
    try {
      // Buscar a inscrição atual
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Atualizar apenas o status de pagamento
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ 
          is_paid: isPaid,
          paid_at: isPaid ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success(`Status de pagamento atualizado com sucesso`);
      fetchData(); // Atualizar dados
    } catch (error: any) {
      console.error('Erro ao atualizar status de pagamento:', error);
      toast.error('Erro ao atualizar status de pagamento');
    }
  };
  
  const handleDelete = async (id: string, type?: 'subscription' | 'minicourse') => {
    if (!confirm('Tem certeza que deseja remover esta inscrição? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      console.log('Iniciando remoção de inscrição:', id, type);
      await deleteSubscription(id, type);
      
      // Força uma atualização imediata dos dados
      await refetch();
      
      toast.success('Inscrição removida com sucesso');
    } catch (error) {
      console.error('Erro ao remover inscrição:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Ocorreu um erro ao remover a inscrição');
      }
    }
  };
  
  // Filtrar e ordenar as inscrições
  const filteredSubscriptions = [...subscriptions]
    .filter(sub => {
      // Filtrar por termo de busca
      const matchesSearch = 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.phone.includes(searchTerm);
      
      if (!matchesSearch) return false;
      
      // Verificar se a inscrição deve ser exibida
      // Inscrições pagas são sempre exibidas
      if (sub.is_paid) return true;
      
      // Para inscrições não pagas, verificar se passaram 48 horas
      const createdAt = new Date(sub.created_at);
      const now = new Date();
      const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      
      // Exibir apenas se ainda não passou 48 horas
      return diffInHours <= 48;
    })
    .sort((a, b) => {
      const fieldA = a[sortBy];
      const fieldB = b[sortBy];
      
      if (fieldA === fieldB) return 0;
      
      // Se o campo for uma string
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB) 
          : fieldB.localeCompare(fieldA);
      }
      
      // Se for booleano, true vem primeiro em ordem ascendente
      if (typeof fieldA === 'boolean' && typeof fieldB === 'boolean') {
        return sortDirection === 'asc'
          ? (fieldA ? -1 : 1)
          : (fieldA ? 1 : -1);
      }
      
      return 0;
    });
  
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Inscrições</h1>
              <p className="text-muted-foreground">
                Inscrições pagas e inscrições recentes (últimas 48h) para o Congresso Equestre 2025
              </p>
            </div>
            <Button onClick={() => navigate('/admin/dashboard')} className="mt-4 md:mt-0">
              Voltar para o Dashboard
            </Button>
          </div>
          
          <Card className="backdrop-blur-sm bg-white/70 border border-white/20 mb-8">
            <CardHeader>
              <CardTitle>Lista de Inscrições</CardTitle>
              <CardDescription>
                {filteredSubscriptions.length} inscrições encontradas
                <div className="mt-2 flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground">
                    Inscrições não pagas são automaticamente ocultadas após 48 horas, mas permanecem no banco de dados.
                  </span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por nome, email ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-lg">Carregando inscrições...</p>
                </div>
              ) : filteredSubscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">Nenhuma inscrição encontrada.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 font-semibold" onClick={() => handleSort('name')}>
                          Nome {sortBy === 'name' && (sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}
                        </th>
                        <th className="p-2 font-semibold">Email</th>
                        <th className="p-2 font-semibold">CPF</th>
                        <th className="p-2 font-semibold">Instituição</th>
                        <th className="p-2 font-semibold">Tipo/Minicurso</th>
                        <th className="p-2 font-semibold" onClick={() => handleSort('created_at')}>
                          Data {sortBy === 'created_at' && (sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}
                        </th>
                        <th className="p-2 font-semibold" onClick={() => handleSort('is_paid')}>
                          Status {sortBy === 'is_paid' && (sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}
                        </th>
                        <th className="p-2 font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubscriptions.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{item.name}</td>
                          <td className="p-2">{item.email}</td>
                          <td className="p-2">{item.cpf}</td>
                          <td className="p-2">{item.institution || '-'}</td>
                          <td className="p-2">
                            {item.type === 'minicourse' ? (
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                                {item.minicourse_title}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                Inscrição Regular
                              </span>
                            )}
                          </td>
                          <td className="p-2">{formatDate(item.created_at)}</td>
                          <td className="p-2">
                            {item.is_paid ? (
                              <span className="inline-flex items-center text-green-600">
                                <Check className="mr-1 h-4 w-4" /> Pago
                                {item.paid_at && <span className="ml-1 text-xs">({formatDate(item.paid_at)})</span>}
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-amber-600">
                                <AlertCircle className="mr-1 h-4 w-4" /> Pendente
                              </span>
                            )}
                          </td>
                          <td className="p-2">
                            <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                size="icon"
                                className={`${item.is_paid ? 'hover:bg-red-50' : 'hover:bg-green-50'}`}
                                onClick={() => handlePaymentStatusChange(item.id, !item.is_paid)}
                                title={item.is_paid ? 'Marcar como não pago' : 'Marcar como pago'}
                              >
                                {item.is_paid ? (
                                  <X className="h-4 w-4 text-red-500" />
                                ) : (
                                  <Check className="h-4 w-4 text-green-500" />
                                )}
                                </Button>
                              <Button 
                                variant="outline"
                                size="icon"
                                className="hover:bg-red-50"
                                onClick={() => handleDelete(item.id, item.type)}
                                title="Remover inscrição"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminSubscriptions;
