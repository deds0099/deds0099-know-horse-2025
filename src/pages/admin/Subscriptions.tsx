import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, X, Search, ArrowUp, ArrowDown } from 'lucide-react';
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
    
    // Busca as inscrições
    const { data, error } = await supabase
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

    console.log('Inscrições encontradas:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Erro detalhado ao buscar inscrições:', error);
    throw error;
  }
};

const updatePaymentStatus = async (id: string, isPaid: boolean) => {
  try {
    console.log('Tentando atualizar status de pagamento:', { id, isPaid });
    
    const updates = {
      is_paid: isPaid,
      status: isPaid ? 'paid' : 'pending',
      paid_at: isPaid ? new Date().toISOString() : null
    };

    console.log('Dados a serem atualizados:', updates);

    // Primeiro, verifica se a inscrição existe
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select()
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar inscrição:', fetchError);
      throw new Error(`Erro ao buscar inscrição: ${fetchError.message}`);
    }

    if (!existingSubscription) {
      throw new Error('Inscrição não encontrada');
    }

    // Atualiza os dados
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError);
      throw new Error(`Erro ao atualizar status: ${updateError.message}`);
    }

    console.log('Atualização bem-sucedida para a inscrição:', id);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
};

const AdminSubscriptions = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof Subscription>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const { 
    data: subscriptions = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: fetchSubscriptions,
    enabled: !!user,
    refetchInterval: 5000 // Atualiza a cada 5 segundos
  });
  
  useEffect(() => {
    if (error) {
      toast.error('Erro ao carregar inscrições');
      console.error(error);
    }
  }, [error]);
  
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
  
  const handlePaymentStatus = async (id: string, newStatus: boolean) => {
    try {
      console.log('Iniciando atualização de status:', { id, newStatus });
      await updatePaymentStatus(id, newStatus);
      
      // Força uma atualização imediata dos dados
      await refetch();
      
      toast.success('Status de pagamento atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Ocorreu um erro ao atualizar o status de pagamento');
      }
    }
  };
  
  // Filtrar e ordenar as inscrições
  const filteredSubscriptions = [...subscriptions]
    .filter(sub => 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.phone.includes(searchTerm)
    )
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
                Gerencie as inscrições para o Congresso Equestre 2025
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
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th 
                          className="px-4 py-3 text-left cursor-pointer hover:bg-accent/50"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center">
                            Nome
                            {sortBy === 'name' && (
                              sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left cursor-pointer hover:bg-accent/50"
                          onClick={() => handleSort('email')}
                        >
                          <div className="flex items-center">
                            Email
                            {sortBy === 'email' && (
                              sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left">Telefone</th>
                        <th className="px-4 py-3 text-left">CPF</th>
                        <th className="px-4 py-3 text-left">Instituição</th>
                        <th 
                          className="px-4 py-3 text-center cursor-pointer hover:bg-accent/50"
                          onClick={() => handleSort('is_paid')}
                        >
                          <div className="flex items-center justify-center">
                            Pago
                            {sortBy === 'is_paid' && (
                              sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left cursor-pointer hover:bg-accent/50"
                          onClick={() => handleSort('created_at')}
                        >
                          <div className="flex items-center">
                            Data
                            {sortBy === 'created_at' && (
                              sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubscriptions.map((subscription) => (
                        <tr key={subscription.id} className="border-b hover:bg-accent/50 transition-colors">
                          <td className="px-4 py-3">{subscription.name}</td>
                          <td className="px-4 py-3">{subscription.email}</td>
                          <td className="px-4 py-3">{subscription.phone}</td>
                          <td className="px-4 py-3">{subscription.cpf}</td>
                          <td className="px-4 py-3">{subscription.institution}</td>
                          <td className="px-4 py-3 text-center">
                            {subscription.is_paid ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Check className="mr-1 h-3 w-3" /> Sim
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <X className="mr-1 h-3 w-3" /> Não
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">{formatDate(subscription.created_at)}</td>
                          <td className="px-4 py-3 text-right">
                            {subscription.is_paid ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePaymentStatus(subscription.id, false)}
                              >
                                Marcar como não pago
                              </Button>
                            ) : (
                              <Button 
                                size="sm"
                                onClick={() => handlePaymentStatus(subscription.id, true)}
                              >
                                Confirmar pagamento
                              </Button>
                            )}
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
